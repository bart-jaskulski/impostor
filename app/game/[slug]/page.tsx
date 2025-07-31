import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/db';
import { games } from '@/db/schema';
import { eq } from 'drizzle-orm';
import GameClient from './game-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { joinGame } from '@/app/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { JoinGameForm } from './join-game-form';

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: gameId } = await params;

  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    with: {
      players: true,
    },
  });

  if (!game) {
    return <div>Game not found.</div>;
  }

  if (game.status === 'finished') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Game Over</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This game has already finished.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  let currentPlayer = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, jwtSecret, { algorithms: ['HS256'] });
      const playerId = payload.sub as string;
      
      const playerInGame = game.players.find(p => p.id === playerId);
      if (playerInGame) {
        currentPlayer = playerInGame;
      }

    } catch {
      // Invalid token, user will be prompted to join.
    }
  }

  if (!currentPlayer) {
    return <JoinGameForm gameId={gameId} />;
  }

  return <GameClient initialGame={game} currentPlayer={currentPlayer} gameId={gameId} />;
}
