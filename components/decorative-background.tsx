import { cn } from '@/lib/utils';

interface DecorativeBackgroundProps {
  variant?: 'default' | 'discussion' | 'voting';
  className?: string;
}

export function DecorativeBackground({ 
  variant = 'default', 
  className 
}: DecorativeBackgroundProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'discussion':
        return (
          <>
            <div className="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-accent/5 rounded-full blur-2xl animate-pulse"></div>
          </>
        );
      case 'voting':
        return (
          <>
            <div className="absolute top-20 left-10 w-40 h-40 bg-destructive/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-60 h-60 bg-destructive/10 rounded-full blur-2xl animate-pulse"></div>
          </>
        );
      default:
        return (
          <>
            <div className="absolute top-10 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          </>
        );
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {getVariantClasses()}
    </div>
  );
}