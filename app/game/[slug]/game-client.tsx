'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

type Player = { id: string; name: string; role: string | null; status: string; isGatheringSummoned: boolean; online: boolean; isObserver: boolean; };
type Game = { id: string; status: string; players: Player[]; impostorSecret: string; playerSecret: string; };

interface GameClientProps {
  initialGame: Game;
  currentPlayer: Player;
  gameId: string;
}

export default function GameClient({ initialGame, currentPlayer, gameId }: GameClientProps) {
  const { socket, isConnected } = useSocket(gameId);
  const [game, setGame] = useState<Game>(initialGame);
  const [voteState, setVoteState] = useState<{ initiator: Player; nominatedPlayerId: string } | null>(null);
  const [voteResult, setVoteResult] = useState<{ eliminatedPlayer: Player | null; outcome: string } | null>(null);
  const [gameOverState, setGameOverState] = useState<{ winner: string; players: Player[] } | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [voteProgress, setVoteProgress] = useState(0);
  const [isSelectingVictim, setIsSelectingVictim] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (updatedGame: Game) => setGame(updatedGame);
    const handleGameStarted = (startedGame: Game) => {
        setGame(startedGame);
        setGameOverState(null);
        setShowRoleModal(true);
    }
    const handleVoteStarted = (data: { initiator: Player; nominatedPlayerId: string }) => {
      setVoteState(data);
      setVoteResult(null);
      setHasVoted(false);
      setVoteProgress(100);
    };
    const handleVoteEnded = (data: { eliminatedPlayer: Player | null; outcome:string }) => {
      setVoteState(null);
      setVoteResult(data);
      setVoteProgress(0);
      setHasVoted(false);
      setTimeout(() => setVoteResult(null), 5000);
    };
    const handleGameOver = (data: { winner: string; players: Player[] }) => {
      setGameOverState(data);
      setVoteState(null);
    };

    socket.on('game_update', handleGameUpdate);
    socket.on('game_started', handleGameStarted);
    socket.on('vote_started', handleVoteStarted);
    socket.on('vote_ended', handleVoteEnded);
    socket.on('game_over', handleGameOver);

    return () => {
      socket.off('game_update', handleGameUpdate);
      socket.off('game_started', handleGameStarted);
      socket.off('vote_started', handleVoteStarted);
      socket.off('vote_ended', handleVoteEnded);
      socket.off('game_over', handleGameOver);
    };
  }, [socket]);

  useEffect(() => {
    if (voteState) {
      const timer = setTimeout(() => setVoteProgress(0), 100);
      return () => clearTimeout(timer);
    }
  }, [voteState]);

  const handleStartGame = () => socket?.emit('start_game');
  const handleSummonGathering = (nominatedPlayerId: string) => {
    socket?.emit('summon_gathering', { nominatedPlayerId });
    setIsSelectingVictim(false);
  }
  const handleSubmitVote = (choice: 'drop' | 'remain') => {
    if (voteState) {
      socket?.emit('submit_vote', { nominatedPlayerId: voteState.nominatedPlayerId, choice });
      setHasVoted(true);
    }
  };

  const me = game.players.find(p => p.id === currentPlayer.id);

  if (!isConnected) {
    return <div className="flex min-h-screen items-center justify-center">Connecting to the game...</div>;
  }

  if (!me) {
    return <div className="flex min-h-screen items-center justify-center">Re-syncing player data...</div>;
  }

  if (game.status === 'lobby') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Card className="mx-auto w-full max-w-lg">
          <CardHeader>
            <CardTitle>Lobby: {game.id}</CardTitle>
            <CardDescription>Share the URL to invite others. Waiting for the game to start...</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Welcome, <strong>{me.name}</strong>!</p>
            <h3 className="mt-4 mb-2 font-bold">Players Joined:</h3>
            <div className="flex flex-wrap gap-2">
              {game.players.map(player => (
                <Badge key={player.id} variant={player.id === me.id ? 'default' : 'secondary'}>
                  {player.name}
                  {player.isObserver && <span className="ml-1.5">(Observer)</span>}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartGame}>Start Game</Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (game.status === 'in-progress' || game.status === 'finished') {
    return (
        <main className="container mx-auto p-4 pb-20">
            <div className="mb-6 text-center">
                <h1 className="text-3xl font-bold">Game in Progress</h1>
                {isSelectingVictim && <p className="text-lg text-primary animate-pulse">Select a player to nominate</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {game.players.map(player => (
                    <Card
                        key={player.id}
                        onClick={() => {
                            if (isSelectingVictim && me.status === 'active' && !me.isObserver && player.id !== me.id && player.status === 'active' && !player.isObserver) {
                                handleSummonGathering(player.id);
                            }
                        }}
                        className={`
                        ${player.status === 'ghost' ? 'bg-muted opacity-50' : ''}
                        ${!player.online ? 'opacity-50' : ''}
                        ${player.id === me.id ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${isSelectingVictim && me.status === 'active' && !me.isObserver && player.id !== me.id && player.status === 'active' && !player.isObserver ? 'cursor-pointer hover:bg-primary/10' : ''}
                        `}
                    >
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {player.name}
                            {player.id === me.id && <span className="text-sm font-normal text-muted-foreground">(You)</span>}
                            <span className={`h-2 w-2 rounded-full ${player.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        </CardTitle>
                        {player.isObserver && <CardDescription>Observer</CardDescription>}
                        {player.status === 'ghost' && <CardDescription>Eliminated</CardDescription>}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {game.status === 'in-progress' && !voteState && (
              <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-background/80 backdrop-blur-sm">
                <Button
                  size="lg"
                  disabled={me.isGatheringSummoned || me.status === 'ghost' || me.isObserver}
                  onClick={() => setIsSelectingVictim(prev => !prev)}
                  variant={isSelectingVictim ? 'destructive' : 'default'}
                >
                  {isSelectingVictim ? 'Cancel Nomination' : 'Summon Gathering'}
                </Button>
              </div>
            )}

            {voteState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <Card className="w-full max-w-sm animate-in fade-in-90">
                        <CardHeader className="text-center">
                            <CardTitle>Vote Now!</CardTitle>
                            <CardDescription className="text-lg">
                                <strong>{voteState.initiator.name}</strong>
                                <span className="mx-2 font-bold">→</span>
                                <strong>{game.players.find(p => p.id === voteState.nominatedPlayerId)?.name}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-around">
                            {!hasVoted ? (
                                <>
                                    <Button variant="destructive" onClick={() => handleSubmitVote('drop')}>Drop</Button>
                                    <Button variant="secondary" onClick={() => handleSubmitVote('remain')}>Remain</Button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Waiting for other players...</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${voteProgress}%`, transition: 'width 120s linear' }}></div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {voteResult && (
                <div className="fixed w-[300px] right-5 bottom-5 z-50">
                    <Card className="w-full max-w-sm animate-in fade-in-90 slide-in-from-bottom-10">
                        <CardHeader>
                            <CardTitle>Vote Result</CardTitle>
                            <CardDescription>
                                {voteResult.eliminatedPlayer
                                    ? `${voteResult.eliminatedPlayer.name} was eliminated!`
                                    : 'The player remains.'}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            )}

            {gameOverState && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <Card className="w-full max-w-md text-center animate-in fade-in-90">
                        <CardHeader>
                            <CardTitle className="text-3xl">Game Over!</CardTitle>
                            <CardDescription className="text-2xl font-bold capitalize">
                                {gameOverState.winner}s Win!
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h3 className="mb-2 font-bold">The impostor(s) were:</h3>
                            {gameOverState.players.filter(p => p.role === 'impostor').map(impostor => (
                                <p key={impostor.id}>{impostor.name}</p>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {showRoleModal && me && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <Card className="w-full max-w-md text-center">
                  <CardHeader>
                    <CardTitle>Your Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold capitalize">{me.role}</p>
                    <p className="text-lg text-muted-foreground mt-2">
                      Secret: {me.role === 'impostor' ? game.impostorSecret : game.playerSecret}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => setShowRoleModal(false)}>Got it!</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
        </main>
    )
  }

  return <div className="flex min-h-screen items-center justify-center">Loading game...</div>;
}

