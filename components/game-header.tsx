import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

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

  return (
    <header className={cn('border-b border-gray-200 bg-white px-4 py-3 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        {/* Left side - Game title and round */}
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Impostor Game</h1>
          <span className="text-sm font-medium text-gray-500 sm:text-base">Round {round}</span>
        </div>

        {/* Center - Phase info (hidden on mobile) */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-orange-800">{phase}</span>
          </div>
        </div>

        {/* Right side - Timer (only shown during voting) */}
        <div className="flex items-center gap-3">
          {isVoting && timer !== undefined && (
            <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-2 sm:gap-2 sm:px-3">
              <Clock className="h-5 w-5 text-red-600 sm:h-6 sm:w-6" />
              <div className="text-right">
                <div className="text-xs font-medium text-red-600">Time Left</div>
                <div className="font-mono text-sm font-bold text-red-700 sm:text-lg">
                  {formatTimer(timer)}
                </div>
              </div>
            </div>
          )}

          {/* Phase info for mobile */}
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 md:hidden">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
            <span className="text-xs font-medium text-orange-800">{phase}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
