import { cn } from '@/lib/utils';
import { Gamepad2, Users } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  icon = <Gamepad2 className="h-8 w-8 text-primary-foreground" />,
  subtitle,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("py-10 text-center relative z-10", className)}>
      <div className="mb-6 inline-flex items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
          {icon}
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>}
        </div>
      </div>
      <p className="mx-auto max-w-lg text-muted-foreground">
        {description}
      </p>
    </div>
  );
}