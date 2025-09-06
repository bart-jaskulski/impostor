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
import { Loader2, Users, X, Vote, Eye, Ghost, Zap, User, Target, MessageSquare, Search, MousePointerClick, Clock } from 'lucide-react';
import { PlayerAvatar } from '@/components/player-avatar';
import { GameHeader } from '@/components/game-header';
import { GameSidebar } from '@/components/game-sidebar';
import { DecorativeBackground } from '@/components/decorative-background';
import { PageHeader } from '@/components/page-header';
import { PlayerList } from '@/components/player-list';

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
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex items-center justify-center p-4">
        <DecorativeBackground variant="default" />
        
        <div className="text-center relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Connecting to the game...</h2>
          <p className="text-muted-foreground">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex items-center justify-center p-4">
        <DecorativeBackground variant="default" />
        
        <div className="text-center relative z-10">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Re-syncing player data...</h2>
          <p className="text-muted-foreground">Please wait while we update your information</p>
        </div>
      </div>
    );
  }

  if (game.status === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 p-4">
        <DecorativeBackground variant="default" />
        
        <PageHeader
          title="Impostor Game"
          subtitle="The ultimate social deduction experience"
          description="Game Lobby - Share this URL to invite others to join your game"
          icon={<Users className="h-8 w-8 text-primary-foreground" />}
          className="py-8"
        />

        <main className="flex justify-center px-4 pb-12 relative z-10">
          <div className="w-full max-w-2xl space-y-6">
            {/* Game Info Card */}
            <Card className="shadow-xl border-2 border-border/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Target className="h-6 w-6 text-primary" />
                      Game Lobby: {game.id}
                    </CardTitle>
                    <CardDescription className="mt-1 text-base">
                      Welcome, <strong className="text-primary">{me.name}</strong>! Waiting for the game to start...
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    Lobby
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL Display */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <label className="text-base font-medium text-foreground">Share this URL with friends:</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border bg-muted p-4 font-mono text-sm">
                      {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
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
                <PlayerList
                  players={game.players}
                  currentPlayerId={me.id}
                  title="Players Joined"
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleStartGame}
                  size="lg"
                  className="w-full text-lg font-semibold h-12 shadow-lg"
                >
                  Start Game
                </Button>
              </CardFooter>
            </Card>
            
            {/* Game Instructions */}
            <Card className="backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-primary/5">
                    <div className="mb-3 p-3 bg-primary/10 rounded-xl">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground">Receive Your Role</h4>
                    <p className="text-xs text-muted-foreground mt-2">Each player gets a secret role and information</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/5">
                    <div className="mb-3 p-3 bg-accent/10 rounded-xl">
                      <MessageSquare className="h-6 w-6 text-accent" />
                    </div>
                    <h4 className="font-semibold text-foreground">Discuss & Deduce</h4>
                    <p className="text-xs text-muted-foreground mt-2">Share stories and identify inconsistencies</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 rounded-lg bg-destructive/5">
                    <div className="mb-3 p-3 bg-destructive/10 rounded-xl">
                      <Vote className="h-6 w-6 text-destructive" />
                    </div>
                    <h4 className="font-semibold text-foreground">Vote & Eliminate</h4>
                    <p className="text-xs text-muted-foreground mt-2">Vote out players you suspect are impostors</p>
                  </div>
                </div>
              </CardContent>
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
      <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20">
        {/* Background decorative elements */}
        <DecorativeBackground 
          variant={currentPhase === 'Discussion Phase' ? 'discussion' : 'voting'} 
        />

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
            <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Game Progress</h2>
                <span className="text-sm text-muted-foreground">
                  {game.players.filter((p) => p.status === 'active').length}/{game.players.length}{' '}
                  players ready
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{
                    width: `${(game.players.filter((p) => p.status === 'active').length / Math.max(game.players.length, 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Players Grid */}
            <div className="flex-1 overflow-auto p-4 md:p-6">
              <div className="mb-4">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Players ({game.players.filter((p) => !p.isObserver && p.status !== 'ghost').length} alive)
                  </h3>
                </div>
                {isSelectingVictim && (
                  <div className="mb-4 rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="text-primary font-medium">
                      Select a player to nominate for voting
                    </p>
                  </div>
                )}
              </div>

              <PlayerList
                players={game.players}
                currentPlayerId={me.id}
                title="Players"
                showStatus={true}
                onPlayerClick={handleSummonGathering}
                selectablePlayers={game.players
                  .filter(player => 
                    isSelectingVictim &&
                    me.status === 'active' &&
                    !me.isObserver &&
                    player.id !== me.id &&
                    player.status === 'active' &&
                    !player.isObserver
                  )
                  .map(player => player.id)
                }
              />
            </div>

            {/* Mobile Voting Button */}
            {canStartVoting && (
              <div className="border-t border-border bg-card/80 backdrop-blur-sm p-4 lg:hidden">
                <Button
                  onClick={() => setIsSelectingVictim((prev) => !prev)}
                  size="lg"
                  variant={isSelectingVictim ? 'destructive' : 'default'}
                  className={`w-full font-semibold h-12`}
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

        {/* Voting Modal */}
        {voteState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="animate-in fade-in-90 slide-in-from-bottom-4 w-full max-w-md mx-4 border-0 shadow-2xl bg-card">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <Vote className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-2xl">Vote Now!</CardTitle>
                <CardDescription className="text-lg mt-2">
                  <strong className="text-primary">{voteState.initiator.name}</strong>
                  <span className="mx-2 font-bold text-muted-foreground">→</span>
                  <strong className="text-destructive">
                    {game.players.find((p) => p.id === voteState.nominatedPlayerId)?.name}
                  </strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasVoted ? (
                  <div className="flex gap-4">
                    <Button 
                      variant="destructive" 
                      onClick={() => handleSubmitVote('drop')}
                      size="lg"
                      className="flex-1 py-6 text-lg font-semibold"
                    >
                      Drop
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleSubmitVote('remain')}
                      size="lg"
                      className="flex-1 py-6 text-lg font-semibold"
                    >
                      Remain
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-muted-foreground">Waiting for other players...</span>
                  </div>
                )}
                
                {/* Voting Timer */}
                {voteTimer > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>Time remaining: {Math.floor(voteTimer / 60)}:{(voteTimer % 60).toString().padStart(2, '0')}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-destructive to-primary transition-all duration-1000"
                        style={{ width: `${(voteTimer / 120) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vote Result Notification */}
        {voteResult && (
          <div className="fixed right-4 bottom-4 z-50 w-full max-w-sm animate-in slide-in-from-bottom-4 duration-300">
            <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  {voteResult.eliminatedPlayer ? (
                    <>
                      <X className="h-5 w-5 text-destructive" />
                      Player Eliminated
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5 text-accent" />
                      Player Remains
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {voteResult.eliminatedPlayer
                    ? `${voteResult.eliminatedPlayer.name} was eliminated from the game!`
                    : 'The player remains in the game.'}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        {/* Game Over Modal */}
        {gameOverState && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="animate-in fade-in-90 slide-in-from-bottom-4 w-full max-w-md mx-4 border-0 shadow-2xl bg-card">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                  <Zap className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl">Game Over!</CardTitle>
                <CardDescription className="text-2xl font-bold capitalize mt-2">
                  {gameOverState.winner === 'impostor' ? (
                    <span className="text-destructive">Impostors Win!</span>
                  ) : (
                    <span className="text-accent">Players Win!</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-3 text-center font-bold text-foreground">The impostor(s) were:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {gameOverState.players
                      .filter((p) => p.role === 'impostor')
                      .map((impostor) => (
                        <div key={impostor.id} className="flex items-center gap-3 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                            <Zap className="h-5 w-5 text-destructive" />
                          </div>
                          <span className="font-medium text-foreground">{impostor.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full text-lg font-semibold h-12 shadow-lg"
                  size="lg"
                  onClick={() => window.location.reload()}
                >
                  Play Again
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Role Modal */}
        {showRoleModal && me && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <Card className="animate-in fade-in-90 slide-in-from-bottom-4 w-full max-w-md mx-4 border-0 shadow-2xl bg-card">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  {me.role === 'impostor' ? (
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  ) : (
                    <User className="h-6 w-6 text-primary-foreground" />
                  )}
                </div>
                <CardTitle>Your Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold capitalize mb-2">
                    {me.role === 'impostor' ? (
                      <span className="text-destructive">Impostor</span>
                    ) : (
                      <span className="text-primary">Player</span>
                    )}
                  </p>
                  <div className="mt-4 p-4 bg-muted rounded-lg border">
                    <p className="text-foreground">
                      <span className="font-semibold">Secret:</span>{' '}
                      <span className="font-mono text-sm">
                        {me.role === 'impostor' ? game.impostorSecret : game.playerSecret}
                      </span>
                    </p>
                  </div>
                </div>
                
                {me.role === 'impostor' && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-destructive" />
                      <span className="text-sm font-semibold text-destructive">Impostor Tips</span>
                    </div>
                    <ul className="text-xs text-destructive space-y-1">
                      <li>• Blend in with the group discussion</li>
                      <li>• Avoid giving too specific details</li>
                      <li>• Redirect suspicion when possible</li>
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full text-lg font-semibold h-12 shadow-lg"
                  size="lg"
                  onClick={() => setShowRoleModal(false)}
                >
                  Got it!
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 flex items-center justify-center p-4">
      <DecorativeBackground variant="default" />
      
      <div className="text-center relative z-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Loading game...</h2>
        <p className="text-muted-foreground">Please wait while we set up your game</p>
      </div>
    </div>
  );
}
