'use client';

import { useActionState } from 'react';
import { joinGame } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Eye } from 'lucide-react';

const initialState = {
  error: '',
};

export function JoinGameForm({ gameId }: { gameId: string }) {
  const [state, formAction] = useActionState(joinGame, initialState);

  return (
    <div className="min-h-screen bg-orange-50">
      {/* Header */}
      <div className="py-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
            <span className="text-sm font-bold text-white">IG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Impostor Game</h1>
        </div>
        <p className="mx-auto max-w-md text-gray-600">
          Join an existing game and start playing with your friends
        </p>
      </div>

      <main className="flex justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Join Game {gameId}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                <input type="hidden" name="gameId" value={gameId} />

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your display name"
                    required
                    className="focus:border-orange-300 focus:ring-orange-200"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isObserver" name="isObserver" />
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <label
                      htmlFor="isObserver"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Join as Observer
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Observers can watch the game but don't participate in voting
                </p>

                {state?.error && (
                  <p className="text-destructive text-sm font-medium">{state.error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-500 text-white hover:bg-orange-600"
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
