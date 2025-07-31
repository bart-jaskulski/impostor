import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const games = sqliteTable('games', {
	id: text('id').primaryKey(), // nanoid
	status: text('status', { enum: ['lobby', 'in-progress', 'finished'] })
		.notNull()
		.default('lobby'),
	impostorCount: integer('impostor_count').notNull(),
	playerSecret: text('player_secret').notNull(),
	impostorSecret: text('impostor_secret').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const players = sqliteTable('players', {
	id: text('id').primaryKey(), // nanoid
	gameId: text('game_id')
		.notNull()
		.references(() => games.id),
	name: text('name').notNull(),
	role: text('role', { enum: ['player', 'impostor'] }),
	status: text('status', { enum: ['active', 'ghost'] })
		.notNull()
		.default('active'),
	isGatheringSummoned: integer('is_gathering_summoned', { mode: 'boolean' })
		.notNull()
		.default(false),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

export const gamesRelations = relations(games, ({ many }) => ({
	players: many(players)
}));

export const playersRelations = relations(players, ({ one }) => ({
	game: one(games, {
		fields: [players.gameId],
		references: [games.id]
	})
}));
