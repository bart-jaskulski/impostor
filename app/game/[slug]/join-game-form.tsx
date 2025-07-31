'use client';

import { useActionState } from 'react';
import { joinGame } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

const initialState = {
  error: '',
};

export function JoinGameForm({ gameId }: { gameId: string }) {
  const [state, formAction] = useActionState(joinGame, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Game {gameId}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <input type="hidden" name="gameId" value={gameId} />
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isObserver" name="isObserver" />
                <label
                  htmlFor="isObserver"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Join as Observer
                </label>
              </div>
              {state?.error && (
                <p className="text-sm font-medium text-destructive">{state.error}</p>
              )}
              <Button type="submit" className="w-full">
                Join Game
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
