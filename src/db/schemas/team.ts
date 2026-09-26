import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'

import { arenas } from '@/db/schemas/arena'

export const teams = pgTable(
  'teams',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 60 }).notNull(),
    shortName: varchar('short_name', { length: 6 }),
    logoUrl: text('logo_url'),
    arenaId: uuid('arena_id')
      .notNull()
      .references(() => arenas.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  table => [
    index('teams_arena_id_idx').on(table.arenaId),
    uniqueIndex('teams_arena_id_name_unique').on(table.arenaId, table.name),
  ],
)

export const teamsRelations = relations(teams, ({ one }) => ({
  arena: one(arenas, {
    fields: [teams.arenaId],
    references: [arenas.id],
  }),
}))

export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
