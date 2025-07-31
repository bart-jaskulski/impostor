import { db } from '../db';
import { games, players } from '../db/schema';
import { eq } from 'drizzle-orm';

type BasePlayer = typeof players.$inferSelect;
export type Player = BasePlayer & {
	online: boolean;
	disconnectTimer?: number;
};

type BaseGame = typeof games.$inferSelect;
export type Game = BaseGame & {
	players: Player[];
	votes?: { [playerId:string]: 'drop' | 'remain' };
	voteTimer?: number;
};

const activeGames = new Map<string, Game>();

export async function loadGame(gameId: string): Promise<Game | null> {
	if (activeGames.has(gameId)) {
		return activeGames.get(gameId) as Game;
	}

	const gameFromDb = await db.query.games.findFirst({
		where: eq(games.id, gameId),
		with: {
			players: true
		}
	});

	if (gameFromDb) {
		const augmentedPlayers: Player[] = gameFromDb.players.map(p => ({ ...p, online: true }));
		const game: Game = { ...gameFromDb, players: augmentedPlayers };
		activeGames.set(gameId, game);
		return game;
	}

	return null;
}

export function getGame(gameId: string): Game | null {
	return activeGames.get(gameId) || null;
}

export function updateGame(gameId: string, game: Game): void {
	activeGames.set(gameId, game);
}

export async function persistGame(gameId: string) {
	const game = getGame(gameId);
	if (!game) return;

	await db.transaction(async (tx) => {
		const gameToPersist = { ...game };
		// @ts-ignore
		delete gameToPersist.players;
		// @ts-ignore
		await tx.update(games).set(gameToPersist).where(eq(games.id, gameId));
		for (const player of game.players) {
			const playerToPersist = { ...player };
			// @ts-ignore
			delete playerToPersist.online;
			// @ts-ignore
			delete playerToPersist.disconnectTimer;
			// @ts-ignore
			await tx.update(players).set(playerToPersist).where(eq(players.id, player.id));
		}
	});
}
