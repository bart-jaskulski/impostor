import 'dotenv/config';
import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { jwtVerify } from 'jose';
import { parse } from 'cookie';
import { type Player, loadGame, getGame, updateGame, persistGame } from './lib/gameState';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handler = app.getRequestHandler();

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    path: '/ws',
  });

  const persistenceQueues = new Map<string, Promise<any>>();

  function queuePersistGame(gameId: string) {
    const queue = persistenceQueues.get(gameId) || Promise.resolve();
  
    const newQueue = queue.then(() => persistGame(gameId)).catch(err => {
      console.error(`[${gameId}] Failed to persist game in queue`, err);
    });
  
    persistenceQueues.set(gameId, newQueue);
  }

  io.use(async (socket, next) => {
    const cookieHeader = socket.handshake.headers.cookie;
    if (!cookieHeader) {
      return next(new Error('Authentication error: No cookie provided'));
    }
    const cookies = parse(cookieHeader);
    const sessionToken = cookies[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return next(new Error('Authentication error: No session cookie provided'));
    }
    try {
      const { payload } = await jwtVerify(sessionToken, jwtSecret, { algorithms: ['HS256'] });
      socket.data.playerId = payload.sub;
      socket.data.gameId = payload.iss;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid session token.'));
    }
  });

  const checkWinCondition = (gameId: string) => {
    const game = getGame(gameId);
    if (!game || game.status !== 'in-progress') return;

    const activePlayers = game.players.filter((p) => p.status === 'active' && !p.isObserver);
    const activeImpostors = game.players.filter((p) => p.role === 'impostor' && p.status !== 'ghost');

    let winner: 'player' | 'impostor' | null = null;

    if (activeImpostors.length === 0) {
      winner = 'player';
    } else if (activeImpostors.length >= activePlayers.length / 2) {
      winner = 'impostor';
    }

    if (winner) {
      game.status = 'finished';
      updateGame(gameId, game);
      queuePersistGame(gameId);
      io.to(gameId).emit('game_over', { winner, players: game.players });
    }
  };

  const tallyVotes = (gameId: string, nominatedPlayerId: string) => {
    const game = getGame(gameId);
    if (!game || !game.votes) return;

    const votesForDrop = Object.values(game.votes).filter((v) => v === 'drop').length;
    const votesForRemain = Object.values(game.votes).filter((v) => v === 'remain').length;

    const nominatedPlayer = game.players.find((p) => p.id === nominatedPlayerId);

    if (votesForDrop >= votesForRemain && nominatedPlayer) {
      nominatedPlayer.status = 'ghost';
      io.to(gameId).emit('vote_ended', { eliminatedPlayer: nominatedPlayer, outcome: 'eliminated' });
    } else {
      io.to(gameId).emit('vote_ended', { eliminatedPlayer: null, outcome: 'remained' });
    }
    
    game.votes = {};

    updateGame(gameId, game);
    io.to(gameId).emit('game_update', game);
    queuePersistGame(gameId);
    checkWinCondition(gameId);
  };

  io.on('connection', async (socket) => {
    const { gameId, playerId } = socket.data;
    socket.join(gameId);

    await loadGame(gameId);
    const game = getGame(gameId);
    if (game) {
      const player = game.players.find((p) => p.id === playerId);
      if (player) {
        player.online = true;
        if (player.disconnectTimer) {
            clearTimeout(player.disconnectTimer);
            delete player.disconnectTimer;
        }
      }
      updateGame(gameId, game)
      io.to(gameId).emit('game_update', game);
    } else {
        socket.disconnect();
        return;
    }

    socket.on('start_game', () => {
        const game = getGame(gameId);
        if (!game) return;
        const activePlayers = game.players.filter(p => !p.isObserver);
        if (activePlayers.length < 3 || game.impostorCount >= activePlayers.length / 2) {
          return; // Validation failed
        }
    
        const playersToAssign = [...activePlayers];
        const impostors: Player[] = [];
        for (let i = 0; i < game.impostorCount; i++) {
          const randomIndex = Math.floor(Math.random() * playersToAssign.length);
          impostors.push(playersToAssign.splice(randomIndex, 1)[0]);
        }
    
        game.players.forEach((p) => {
          if (!p.isObserver) {
            // @ts-ignore
            p.role = impostors.some((i) => i.id === p.id) ? 'impostor' : 'player';
          }
        });
        game.status = 'in-progress';
        updateGame(gameId, game);
        io.to(gameId).emit('game_started', game);
      });

    socket.on('summon_gathering', ({ nominatedPlayerId }: { nominatedPlayerId: string}) => {
        const game = getGame(gameId);
        const initiator = game?.players.find((p) => p.id === playerId);
        if (!game || game.status !== 'in-progress' || !initiator || initiator.isObserver || initiator.isGatheringSummoned) {
          return;
        }
    
        initiator.isGatheringSummoned = true;
        game.votes = {}; // Reset votes for the new gathering
        updateGame(gameId, game);
        io.to(gameId).emit('vote_started', { initiator, nominatedPlayerId });
    
        const voteTimer = setTimeout(() => {
          tallyVotes(gameId, nominatedPlayerId);
        }, 120000); // 120 seconds
    
        game.voteTimer = Number(voteTimer);
        updateGame(gameId, game);
      });

    socket.on('submit_vote', ({ nominatedPlayerId, choice }: { nominatedPlayerId: string; choice: 'drop' | 'remain' }) => {
        const game = getGame(gameId);
        if (!game || !game.votes) return;
        const voter = game.players.find(p => p.id === playerId);
        if (!voter || voter.isObserver) return;

        if (!game.votes[playerId]) {
            game.votes[playerId] = choice;
        }
        updateGame(gameId, game);

        const activePlayers = game.players.filter((p) => p.status === 'active' && !p.isObserver).length;
        if (Object.keys(game.votes).length === activePlayers) {
            if(game.voteTimer) clearTimeout(game.voteTimer);
            tallyVotes(gameId, nominatedPlayerId);
        }
    })

    socket.on('disconnect', async () => {
      const game = getGame(gameId);
      if (!game) return;

      const player = game.players.find((p) => p.id === playerId);
      if (!player) return;

      if (player.isObserver) {
        const playerIndex = game.players.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);
        }
      } else {
        player.online = false;
        if (game.status === 'in-progress') {
          const timer = setTimeout(async () => {
              const freshGame = getGame(gameId);
              if (!freshGame) return;
              const freshPlayer = freshGame.players.find((p) => p.id === playerId);
              if (freshPlayer && !freshPlayer.online) {
                  freshPlayer.status = 'ghost';
                  updateGame(gameId, freshGame);
                  queuePersistGame(gameId);
                  io.to(gameId).emit('game_update', freshGame);
                  checkWinCondition(gameId);
              }
          }, 30000);
          player.disconnectTimer = Number(timer);
        }
      }
      
      updateGame(gameId, game);
      io.to(gameId).emit('game_update', game);
    });
  });

  httpServer.listen(port);
  console.log(`> Ready on http://localhost:${port}`);
  console.log(`> Socket.IO listening on path /ws`);
});
