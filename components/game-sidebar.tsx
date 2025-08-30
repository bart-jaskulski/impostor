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
    if (role === 'impostor') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  return (
    <div
      className={cn('flex w-80 flex-col border-r border-gray-200 bg-gray-50 lg:w-80', className)}
    >
      <div className="space-y-4 p-4">
        {/* Player Role Card */}
        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
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
              <h4 className="font-medium text-gray-800">Your Secret:</h4>
              <div className="rounded-lg border bg-gray-100 p-3">
                <p className="text-sm leading-relaxed text-gray-700">{secret}</p>
              </div>
            </div>
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
                'w-full justify-center gap-2 font-semibold',
                isSelectingVictim
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-orange-500 text-white hover:bg-orange-600',
              )}
            >
              {isSelectingVictim ? <X className="h-4 w-4" /> : <Vote className="h-4 w-4" />}
              {isSelectingVictim ? 'Cancel Nomination' : 'Start Voting'}
            </Button>

            {isSelectingVictim && (
              <p className="animate-pulse text-center text-sm text-gray-600">
                {/* AIDEV-NOTE: Use Lucide icons only; replaced emoji pointer with MousePointerClick. */}
                <span className="inline-flex items-center gap-2">
                  <MousePointerClick className="h-4 w-4 text-orange-500" />
                  Click on a player above to nominate them for voting
                </span>
              </p>
            )}
          </div>
        )}

        {/* Game Status Info */}
        <div className="space-y-2 text-sm text-gray-600">
          {player.isObserver && (
            <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2">
              <Eye className="h-4 w-4" />
              <span>You are observing this game</span>
            </div>
          )}

          {player.status === 'ghost' && (
            <div className="flex items-center gap-2 rounded border bg-gray-50 p-2">
              <Ghost className="h-4 w-4" />
              <span>You have been eliminated</span>
            </div>
          )}

          {player.isGatheringSummoned && !isSelectingVictim && (
            <div className="flex items-center gap-2 rounded border border-yellow-200 bg-yellow-50 p-2">
              <Clock className="h-4 w-4" />
              <span>You have already nominated someone</span>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Prompts */}
      <div className="mt-auto border-t border-gray-200 bg-white p-4">
        <h4 className="mb-3 font-medium text-gray-800">Discussion Tips</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <MessageSquare className="mt-0.5 h-4 w-4 text-orange-500" />
            <span>Discuss and share your experiences</span>
          </div>
          <div className="flex items-start gap-2">
            <Search className="mt-0.5 h-4 w-4 text-orange-500" />
            <span>Look for inconsistencies in stories</span>
          </div>
        </div>
      </div>
    </div>
  );
}
