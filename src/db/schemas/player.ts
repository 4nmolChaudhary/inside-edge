import { relations } from 'drizzle-orm'
import { index, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

import { arenas } from '@/db/schemas/arena'
import { teams } from '@/db/schemas/team'

export const players = pgTable(
  'players',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: varchar('first_name', { length: 50 }).notNull(),
    lastName: varchar('last_name', { length: 50 }).notNull(),
    number: integer('number'),
    arenaId: uuid('arena_id')
      .notNull()
      .references(() => arenas.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [index('players_arena_id_idx').on(table.arenaId)],
)

export const arenasRelations = relations(arenas, ({ many }) => ({
  players: many(players),
  teams: many(teams),
}))

export const playersRelations = relations(players, ({ one }) => ({
  arena: one(arenas, {
    fields: [players.arenaId],
    references: [arenas.id],
  }),
}))

export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert

