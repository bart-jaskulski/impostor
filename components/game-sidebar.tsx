import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Target,
  User,
  Zap,
  Vote,
  X,
  Eye,
  Ghost,
  Clock,
  MessageSquare,
  Search,
  MousePointerClick,
  AlertTriangle,
} from 'lucide-react';

type Player = {
  id: string;
  name: string;
  role: string | null;
  status: string;
  isGatheringSummoned: boolean;
  online: boolean;
  isObserver: boolean;
};

interface GameSidebarProps {
  player: Player;
  secret: string;
  isSelectingVictim: boolean;
  canStartVoting: boolean;
  onToggleSelection: () => void;
  className?: string;
}

export function GameSidebar({
  player,
  secret,
  isSelectingVictim,
  canStartVoting,
  onToggleSelection,
  className,
}: GameSidebarProps) {
  const getRoleIcon = (role: string | null) => {
    if (role === 'impostor') return <Zap className="h-6 w-6" />;
    return <User className="h-6 w-6" />;
  };

  const getRoleColor = (role: string | null) => {
    if (role === 'impostor') return 'text-destructive bg-destructive/10 border-destructive/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  return (
    <div
      className={cn('flex w-80 flex-col border-r border-border bg-card lg:w-80', className)}
    >
      <div className="space-y-4 p-4">
        {/* Player Role Card */}
        <Card className="border-2 border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Your Role</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Display */}
            <div className="text-center">
              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border-2 px-4 py-2 text-lg font-bold',
                  getRoleColor(player.role),
                )}
              >
                {getRoleIcon(player.role)}
                <span className="tracking-wide uppercase">{player.role || 'PLAYER'}</span>
              </div>
            </div>

            {/* Secret Information */}
            <div className="space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Your Secret:
              </h4>
              <div className="rounded-lg border bg-muted p-4">
                <p className="text-sm leading-relaxed text-foreground">{secret}</p>
              </div>
            </div>

            {/* Role-specific tips */}
            {player.role === 'impostor' && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
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
        </Card>

        {/* Voting Action Button */}
        {canStartVoting && (
          <div className="space-y-3">
            <Button
              onClick={onToggleSelection}
              size="lg"
              variant={isSelectingVictim ? 'destructive' : 'default'}
              className={cn(
                'w-full justify-center gap-2 font-semibold h-12',
                isSelectingVictim
                  ? ''
                  : '',
              )}
            >
              {isSelectingVictim ? <X className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
              {isSelectingVictim ? 'Cancel Nomination' : 'Start Voting'}
            </Button>

            {isSelectingVictim && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                <p className="text-center text-sm text-primary">
                  <span className="inline-flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4" />
                    Click on a player above to nominate them for voting
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Game Status Info */}
        <div className="space-y-2">
          {player.isObserver && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
              <Eye className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">You are observing this game</span>
            </div>
          )}

          {player.status === 'ghost' && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
              <Ghost className="h-4 w-4 text-foreground" />
              <span className="text-sm text-foreground">You have been eliminated</span>
            </div>
          )}

          {player.isGatheringSummoned && !isSelectingVictim && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">You have already nominated someone</span>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Prompts */}
      <div className="mt-auto border-t border-border bg-card p-4">
        <h4 className="mb-3 font-medium text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Discussion Tips
        </h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
            <div className="mt-0.5 p-1.5 bg-primary/10 rounded-md">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Share Experiences</p>
              <p className="text-xs text-muted-foreground">Discuss and share your personal experiences related to the secret</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors">
            <div className="mt-0.5 p-1.5 bg-primary/10 rounded-md">
              <Search className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Spot Inconsistencies</p>
              <p className="text-xs text-muted-foreground">Listen carefully for contradictions in others' stories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
