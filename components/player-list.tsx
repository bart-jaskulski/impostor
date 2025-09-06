import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Eye, Ghost } from 'lucide-react';
import { PlayerAvatar } from '@/components/player-avatar';

interface Player {
  id: string;
  name: string;
  role: string | null;
  status: string;
  isGatheringSummoned: boolean;
  online: boolean;
  isObserver: boolean;
}

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string;
  title: string;
  showStatus?: boolean;
  onPlayerClick?: (playerId: string) => void;
  selectablePlayers?: string[];
}

export function PlayerList({ 
  players, 
  currentPlayerId, 
  title, 
  showStatus = true,
  onPlayerClick,
  selectablePlayers = []
}: PlayerListProps) {
  const canClick = (playerId: string) => {
    return onPlayerClick && selectablePlayers.includes(playerId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">
          {title} ({players.length})
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {players.map((player) => (
          <Card 
            key={player.id}
            className={`transition-all duration-200 border-2 ${
              player.id === currentPlayerId
                ? 'border-primary/30 bg-primary/5 shadow-sm'
                : canClick(player.id)
                  ? 'border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 cursor-pointer'
                  : 'border-border bg-card hover:shadow-sm'
            } ${player.status === 'ghost' ? 'opacity-70 grayscale' : ''}`}
            onClick={() => canClick(player.id) && onPlayerClick(player.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-foreground">
                      {player.name}
                    </p>
                    {player.id === currentPlayerId && (
                      <Badge className="text-xs py-0.5">
                        You
                      </Badge>
                    )}
                  </div>
                  {showStatus && (
                    <>
                      {player.isObserver ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Observer</span>
                        </div>
                      ) : player.status === 'ghost' ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Ghost className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Eliminated</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`h-2 w-2 rounded-full ${player.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="text-xs text-muted-foreground">
                            {player.online ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {player.isGatheringSummoned && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className="bg-amber-100 text-amber-800 text-xs py-0.5">
                        Nominated
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}