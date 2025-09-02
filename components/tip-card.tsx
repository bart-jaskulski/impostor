import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface TipCardProps {
  title: string;
  icon: ReactNode;
  tips: { 
    icon: ReactNode; 
    title: string; 
    description: string 
  }[];
  className?: string;
}

export function TipCard({ title, icon, tips, className }: TipCardProps) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
              <div className="flex-shrink-0">
                {tip.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}