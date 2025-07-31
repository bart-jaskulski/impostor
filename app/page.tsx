import { createGame } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateGamePage() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create a New Game</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createGame} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="impostorCount">Number of Impostors</Label>
              <Input
                id="impostorCount"
                name="impostorCount"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="playerSecret">Secret for Players</Label>
              <Input id="playerSecret" name="playerSecret" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="impostorSecret">Secret for Impostors</Label>
              <Input id="impostorSecret" name="impostorSecret" required />
            </div>
            <Button type="submit" className="w-full">
              Create Game
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
