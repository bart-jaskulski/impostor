import { cn } from '@/lib/utils';
import { Clock, MessageCircle, Vote } from 'lucide-react';

interface GameHeaderProps {
  round?: number;
  phase?: string;
  timer?: number;
  isVoting?: boolean;
  className?: string;
}

export function GameHeader({
  round = 1,
  phase = 'Discussion Phase',
  timer,
  isVoting = false,
  className,
}: GameHeaderProps) {
  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPhaseIcon = () => {
    if (phase.includes('Voting')) return <Vote className="h-4 w-4" />;
    return <MessageCircle className="h-4 w-4" />;
  };

  const getPhaseColor = () => {
    if (phase.includes('Voting')) return 'bg-destructive/10 text-destructive border-destructive/20';
    return 'bg-primary/10 text-primary border-primary/20';
  };

  return (
    <header className={cn('border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Game title and round */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-foreground sm:text-xl">Impostor Game</h1>
            <span className="text-xs font-medium text-muted-foreground sm:text-sm">Round {round}</span>
          </div>
        </div>

        {/* Center - Phase info */}
        <div className="hidden items-center gap-3 md:flex">
          <div className={cn('flex items-center gap-2 rounded-full border px-4 py-2', getPhaseColor())}>
            {getPhaseIcon()}
            <span className="text-sm font-medium">{phase}</span>
          </div>
        </div>

        {/* Right side - Timer and mobile phase info */}
        <div className="flex items-center gap-3">
          {isVoting && timer !== undefined && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 shadow-sm">
              <Clock className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-xs font-medium text-destructive">Time Left</div>
                <div className="font-mono text-sm font-bold text-destructive">
                  {formatTimer(timer)}
                </div>
              </div>
            </div>
          )}

          {/* Phase info for mobile */}
          <div className={cn('flex items-center gap-2 rounded-full border px-3 py-1.5 md:hidden', getPhaseColor())}>
            {getPhaseIcon()}
            <span className="text-xs font-medium">{phase}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
