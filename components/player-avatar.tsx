import { cn } from '@/lib/utils';
import { User, Eye, Ghost, Zap } from 'lucide-react';

interface PlayerAvatarProps {
  name: string;
  status?: 'online' | 'offline' | 'ghost' | 'observer';
  isImpostor?: boolean;
  isCurrentPlayer?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PlayerAvatar({
  name,
  status = 'online',
  isImpostor = false,
  isCurrentPlayer = false,
  size = 'md',
  className,
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-2xl',
  };

  const statusColors = {
    online: 'bg-primary/20 border-primary/30',
    offline: 'bg-muted border-border',
    ghost: 'bg-muted border-border opacity-70',
    observer: 'bg-accent/20 border-accent/30',
  };

  const getIcon = () => {
    if (status === 'observer') return <Eye className="h-1/2 w-1/2 text-accent" />;
    if (status === 'ghost') return <Ghost className="h-1/2 w-1/2 text-muted-foreground" />;
    if (isImpostor) return <Zap className="h-1/2 w-1/2 text-destructive" />;
    return <User className="h-1/2 w-1/2 text-primary" />;
  };

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center rounded-xl border-2',
      sizeClasses[size],
      statusColors[status],
      className
    )}>
      {getIcon()}
      {isCurrentPlayer && (
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
          <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
        </div>
      )}
    </div>
  );
}
