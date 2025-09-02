import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function SectionHeader({ 
  title, 
  icon, 
  className,
  children
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-serif font-semibold text-foreground">{title}</h2>
        {children}
      </div>
    </div>
  );
}