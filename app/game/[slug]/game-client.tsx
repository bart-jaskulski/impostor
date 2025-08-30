'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { PlayerAvatar } from '@/components/player-avatar';
import { GameHeader } from '@/components/game-header';
import { GameSidebar } from '@/components/game-sidebar';
import { Users, X, Vote } from 'lucide-react';

type Player = {
  id: string;
  name: string;
  role: string | null;
  status: string;
  isGatheringSummoned: boolean;
  online: boolean;
  isObserver: boolean;
};
type Game = {
  id: string;
  status: string;
  players: Player[];
  impostorSecret: string;
  playerSecret: string;
};

interface GameClientProps {
  initialGame: Game;
  currentPlayer: Player;
  gameId: string;
}

export default function GameClient({ initialGame, currentPlayer, gameId }: GameClientProps) {
  const { socket, isConnected } = useSocket(gameId);
  const [game, setGame] = useState<Game>(initialGame);
  const [voteState, setVoteState] = useState<{
    initiator: Player;
    nominatedPlayerId: string;
  } | null>(null);
  const [voteResult, setVoteResult] = useState<{
    eliminatedPlayer: Player | null;
    outcome: string;
  } | null>(null);
  const [gameOverState, setGameOverState] = useState<{ winner: string; players: Player[] } | null>(
    null,
  );
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [voteProgress, setVoteProgress] = useState(0);
  const [isSelectingVictim, setIsSelectingVictim] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteTimer, setVoteTimer] = useState<number>(0);

  useEffect(() => {
    if (!socket) return;

    const handleGameUpdate = (updatedGame: Game) => setGame(updatedGame);
    const handleGameStarted = (startedGame: Game) => {
      setGame(startedGame);
      setGameOverState(null);
      setShowRoleModal(true);
    };
    const handleVoteStarted = (data: { initiator: Player; nominatedPlayerId: string }) => {
      setVoteState(data);
      setVoteResult(null);
      setHasVoted(false);
      setVoteProgress(100);
      setVoteTimer(120); // 2 minutes for voting
    };
    const handleVoteEnded = (data: { eliminatedPlayer: Player | null; outcome: string }) => {
      setVoteState(null);
      setVoteResult(data);
      setVoteProgress(0);
      setHasVoted(false);
      setVoteTimer(0);
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

  // Timer countdown effect
  useEffect(() => {
    if (voteTimer > 0) {
      const interval = setInterval(() => {
        setVoteTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [voteTimer]);

  const handleStartGame = () => socket?.emit('start_game');
  const handleSummonGathering = (nominatedPlayerId: string) => {
    socket?.emit('summon_gathering', { nominatedPlayerId });
    setIsSelectingVictim(false);
  };
  const handleSubmitVote = (choice: 'drop' | 'remain') => {
    if (voteState) {
      socket?.emit('submit_vote', { nominatedPlayerId: voteState.nominatedPlayerId, choice });
      setHasVoted(true);
    }
  };

  const me = game.players.find((p) => p.id === currentPlayer.id);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center">Connecting to the game...</div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center">Re-syncing player data...</div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div className="min-h-screen bg-orange-50">
        {/* Header */}
        <div className="py-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <span className="text-sm font-bold text-white">IG</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Impostor Game</h1>
          </div>
          <p className="mx-auto max-w-md text-gray-600">
            Game Lobby - Share this URL to invite others to join your game
          </p>
        </div>

        <main className="flex justify-center px-4">
          <div className="w-full max-w-lg space-y-6">
            {/* AIDEV-NOTE: URL is presented in lobby for sharing; not shown during creation. */}
            {/* Game Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Game: {game.id}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Lobby
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Welcome, <strong>{me.name}</strong>! Waiting for the game to start...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL Display */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Share this URL:</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded border bg-gray-50 p-2">
                      <code className="text-sm text-gray-700">
                        {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

                {/* Players List */}
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 font-medium">
                    <Users className="h-4 w-4" />
                    Players Joined ({game.players.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {game.players.map((player) => (
                      <div
                        key={player.id}
                        className={`flex items-center gap-2 rounded-lg border p-3 ${
                          player.id === me.id
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-900">
                            {player.name}
                            {player.id === me.id && (
                              <span className="ml-1 text-xs text-orange-600">(You)</span>
                            )}
                          </p>
                          {player.isObserver && <p className="text-xs text-gray-500">Observer</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleStartGame}
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  Start Game
                </Button>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (game.status === 'in-progress' || game.status === 'finished') {
    const canStartVoting =
      game.status === 'in-progress' &&
      !voteState &&
      me.status === 'active' &&
      !me.isObserver &&
      !me.isGatheringSummoned;
    const currentPhase = voteState ? 'Voting Phase' : 'Discussion Phase';

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Game Header */}
        <GameHeader phase={currentPhase} timer={voteTimer} isVoting={!!voteState} />

        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar - hidden on mobile, shown on desktop */}
          <div className="hidden lg:block">
            <GameSidebar
              player={me}
              secret={me.role === 'impostor' ? game.impostorSecret : game.playerSecret}
              isSelectingVictim={isSelectingVictim}
              canStartVoting={canStartVoting}
              onToggleSelection={() => setIsSelectingVictim((prev) => !prev)}
            />
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Phase Progress */}
            <div className="border-b border-gray-200 bg-white px-4 py-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800">Phase Progress</h2>
                <span className="text-sm text-gray-600">
                  {game.players.filter((p) => p.status === 'active').length}/{game.players.length}{' '}
                  players ready
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-orange-500 transition-all duration-300"
                  style={{
                    width: `${(game.players.filter((p) => p.status === 'active').length / Math.max(game.players.length, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="flex-1 overflow-auto p-6">
              <div className="mb-4">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Players ({game.players.filter((p) => !p.isObserver).length} alive)
                  </h3>
                </div>
                {isSelectingVictim && (
                  <p className="mb-4 animate-pulse text-sm text-orange-600">
                    Select a player to nominate for voting
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {game.players.map((player) => {
                  const canClick =
                    isSelectingVictim &&
                    me.status === 'active' &&
                    !me.isObserver &&
                    player.id !== me.id &&
                    player.status === 'active' &&
                    !player.isObserver;

                  return (
                    <Card
                      key={player.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        canClick ? 'hover:border-orange-300 hover:bg-orange-50' : ''
                      } ${player.id === me.id ? 'border-orange-400 ring-2 ring-orange-100' : ''} ${
                        player.status === 'ghost' ? 'opacity-60 grayscale' : ''
                      }`}
                      onClick={() => canClick && handleSummonGathering(player.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="space-y-3">
                          {/* Player Initial Circle */}
                          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                            {player.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Player Name */}
                          <div className="space-y-1">
                            <h3 className="font-medium text-gray-900">
                              {player.name}
                              {player.id === me.id && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 bg-orange-100 text-xs text-orange-800"
                                >
                                  You
                                </Badge>
                              )}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {player.isObserver
                                ? 'Observer'
                                : player.status === 'ghost'
                                  ? 'Eliminated'
                                  : 'Thinking...'}
                            </p>
                          </div>

                          {/* Online Status */}
                          <div className="flex items-center justify-center gap-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                player.online ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              {player.online ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Mobile Voting Button */}
            {canStartVoting && (
              <div className="border-t border-gray-200 bg-white p-4 lg:hidden">
                <Button
                  onClick={() => setIsSelectingVictim((prev) => !prev)}
                  size="lg"
                  variant={isSelectingVictim ? 'destructive' : 'default'}
                  className={`w-full font-semibold ${isSelectingVictim ? '' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                >
                  <span className="flex items-center gap-2">
                    {isSelectingVictim ? <X className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
                    {isSelectingVictim ? 'Cancel Nomination' : 'Start Voting'}
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {voteState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <Card className="animate-in fade-in-90 w-full max-w-sm">
              <CardHeader className="text-center">
                <CardTitle>Vote Now!</CardTitle>
                <CardDescription className="text-lg">
                  <strong>{voteState.initiator.name}</strong>
                  <span className="mx-2 font-bold">→</span>
                  <strong>
                    {game.players.find((p) => p.id === voteState.nominatedPlayerId)?.name}
                  </strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-around">
                {!hasVoted ? (
                  <>
                    <Button variant="destructive" onClick={() => handleSubmitVote('drop')}>
                      Drop
                    </Button>
                    <Button variant="secondary" onClick={() => handleSubmitVote('remain')}>
                      Remain
                    </Button>
                  </>
                ) : (
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Waiting for other players...</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full"
                    style={{ width: `${voteProgress}%`, transition: 'width 120s linear' }}
                  ></div>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {voteResult && (
          <div className="fixed right-5 bottom-5 z-50 w-[300px]">
            <Card className="animate-in fade-in-90 slide-in-from-bottom-10 w-full max-w-sm">
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
            <Card className="animate-in fade-in-90 w-full max-w-md text-center">
              <CardHeader>
                <CardTitle className="text-3xl">Game Over!</CardTitle>
                <CardDescription className="text-2xl font-bold capitalize">
                  {gameOverState.winner}s Win!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="mb-2 font-bold">The impostor(s) were:</h3>
                {gameOverState.players
                  .filter((p) => p.role === 'impostor')
                  .map((impostor) => (
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
                <p className="text-muted-foreground mt-2 text-lg">
                  Secret: {me.role === 'impostor' ? game.impostorSecret : game.playerSecret}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setShowRoleModal(false)}>
                  Got it!
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return <div className="flex min-h-screen items-center justify-center">Loading game...</div>;
}
