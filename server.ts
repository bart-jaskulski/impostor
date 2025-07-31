import 'dotenv/config';
import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';
import { jwtVerify } from 'jose';
import { onEventJoin } from './lib/socket/events';
import { parse } from 'cookie';

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

  // Security middleware for authenticating socket connections
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

  io.on('connection', (socket) => {

    socket.join(socket.data.gameId);

    socket.on('join-event', async (eventSlug) => {
      await onEventJoin(socket, eventSlug);
    });

    socket.on('leave-event', (eventId) => {
      const roomName = `event-${eventId}`;
      socket.leave(roomName);
    });

    socket.on('disconnect', async (reason) => {
      const game = getGame(socket.data.gameId);
      if (!game) return;
      const player = game.players.find((p) => p.id === socket.data.playerId);
      if (player) {
        player.status = 'ghost'; // Treat disconnects as eliminations
        updateGame(socket.data.gameId, game);
        await persistGame(socket.data.gameId);
        io.to(socket.data.gameId).emit('game_update', game);
        checkWinCondition(socket.data.gameId);
      }
    });
  });

  httpServer.listen(port);
  console.log(`> Ready on http://localhost:${port}`);
  console.log(`> Socket.IO listening on path /ws`);
});
