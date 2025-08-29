import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

type Player = {
  id: string;
  name: string;
  role: string | null;
  status: string;
  isGatheringSummoned: boolean;
  online: boolean;
  isObserver: boolean;
};

interface PlayerAvatarProps {
  player: Player;
  isCurrentPlayer?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PlayerAvatar({
  player,
  isCurrentPlayer = false,
  isClickable = false,
  onClick,
  className,
}: PlayerAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    // Generate a consistent color based on the name
    const colors = [
      'bg-orange-500 text-white',
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-red-500 text-white',
      'bg-yellow-500 text-black',
      'bg-teal-500 text-white',
      'bg-cyan-500 text-white',
    ];

    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const avatarClasses = cn(
    'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all duration-200',
    getAvatarColor(player.name),
    {
      'opacity-50': player.status === 'ghost' || !player.online,
      'ring-2 ring-orange-400 ring-offset-2': isCurrentPlayer,
      'cursor-pointer hover:scale-105 hover:shadow-lg': isClickable,
      grayscale: player.status === 'ghost',
    },
    className,
  );

  const containerClasses = cn('relative', {
    'cursor-pointer': isClickable,
  });

  return (
    <div className={containerClasses} onClick={isClickable ? onClick : undefined}>
      <div className={avatarClasses}>{getInitials(player.name)}</div>

      {/* Online status indicator */}
      <div
        className={cn(
          'absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white',
          player.online ? 'bg-green-500' : 'bg-gray-400',
        )}
      />

      {/* Role indicator for current player */}
      {isCurrentPlayer && player.role && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 transform">
          <div className="rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
            You
          </div>
        </div>
      )}

      {/* Observer badge */}
      {player.isObserver && (
        <div className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-500 text-white">
          <Eye className="h-3 w-3" />
        </div>
      )}
    </div>
  );
}
