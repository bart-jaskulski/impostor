'use client';

import { useActionState } from 'react';
import { joinGame } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Eye } from 'lucide-react';
import { DecorativeBackground } from '@/components/decorative-background';
import { PageHeader } from '@/components/page-header';

const initialState = {
  error: '',
};

export function JoinGameForm({ gameId }: { gameId: string }) {
  const [state, formAction] = useActionState(joinGame, initialState);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted/20 p-4">
      <DecorativeBackground />
      
      <PageHeader
        title="Impostor Game"
        subtitle="The ultimate social deduction experience"
        description="Join an existing game and start playing with your friends"
        icon={<User className="h-8 w-8 text-primary-foreground" />}
        className="py-8"
      />

      <main className="flex justify-center px-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-2 border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-serif">
                <User className="h-6 w-6 text-primary" />
                Join Game {gameId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="gameId" value={gameId} />

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your display name"
                    required
                    className="min-h-[44px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isObserver" name="isObserver" />
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <label
                      htmlFor="isObserver"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Join as Observer
                    </label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Observers can watch the game but don't participate in voting
                </p>

                {state?.error && (
                  <p className="text-destructive text-sm font-medium">{state.error}</p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full text-lg font-semibold h-12 shadow-lg hover:shadow-xl transition-shadow"
                >
                  Join Game
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
