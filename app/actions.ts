'use server';

import { redirect } from 'next/navigation';
import { db } from '@/db';
import { games, players } from '@/db/schema';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

const jwtSecret = new TextEncoder().encode(process.env.SESSION_SECRET!);
const SESSION_COOKIE_NAME = 'session';

const createGameSchema = z.object({
  impostorCount: z.coerce.number().min(1),
  playerSecret: z.string().min(1, 'Player secret is required'),
  impostorSecret: z.string().min(1, 'Impostor secret is required'),
});

export async function createGame(formData: FormData) {
  const validatedFields = createGameSchema.safeParse({
    impostorCount: formData.get('impostorCount'),
    playerSecret: formData.get('playerSecret'),
    impostorSecret: formData.get('impostorSecret'),
  });

  if (!validatedFields.success) {
    // Handle error
    return { error: 'Invalid fields' };
  }

  const gameId = nanoid(6);

  await db.insert(games).values({
    id: gameId,
    ...validatedFields.data,
  });

  redirect(`/game/${gameId}`);
}

const joinGameSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gameId: z.string(),
  isObserver: z.preprocess((val) => val === 'on' || val === true, z.boolean()).optional(),
})

export async function joinGame(prevState: { error?: string }, formData: FormData) {
  const validatedFields = joinGameSchema.safeParse({
    name: formData.get('name'),
    gameId: formData.get('gameId'),
    isObserver: formData.get('isObserver'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid name' };
  }

  const { name, gameId, isObserver } = validatedFields.data;

  const existingPlayer = await db.query.players.findFirst({
    where: and(eq(players.gameId, gameId), eq(players.name, name))
  });

  if (existingPlayer) {
    return { error: 'Name is already taken' };
  }

  const playerId = nanoid();

  await db.insert(players).values({
    id: playerId,
    gameId: gameId,
    name: name,
    isObserver: isObserver ?? false,
  });

  const token = await new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(gameId)
    .setSubject(playerId)
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(jwtSecret);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 4, // 4 hours
  });

  redirect(`/game/${gameId}`);
}
