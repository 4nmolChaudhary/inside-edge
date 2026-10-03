import { relations } from 'drizzle-orm'
import { index, integer, pgTable, timestamp, uuid, varchar, smallint, boolean } from 'drizzle-orm/pg-core'

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

export const playerStats = pgTable(
  'player_stats',
  {
    playerId: uuid('player_id')
      .primaryKey()
      .references(() => players.id, { onDelete: 'cascade' }),
    arenaId: uuid('arena_id')
      .notNull()
      .references(() => arenas.id, { onDelete: 'cascade' }),
    // General
    matches: smallint('matches').notNull().default(0),
    // Batting
    innings: smallint('innings').notNull().default(0),
    runs: integer('runs').notNull().default(0),
    ballsFaced: integer('balls_faced').notNull().default(0),
    fours: smallint('fours').notNull().default(0),
    sixes: smallint('sixes').notNull().default(0),
    outs: smallint('outs').notNull().default(0), // for average (not-outs = innings - outs)
    highScore: smallint('high_score').notNull().default(0),
    highScoreNotOut: boolean('high_score_not_out').notNull().default(false),
    fifties: smallint('fifties').notNull().default(0),
    hundreds: smallint('hundreds').notNull().default(0),
    ducks: smallint('ducks').notNull().default(0),
    // Bowling
    ballsBowled: integer('balls_bowled').notNull().default(0), // legal balls
    runsConceded: integer('runs_conceded').notNull().default(0),
    wickets: smallint('wickets').notNull().default(0),
    maidens: smallint('maidens').notNull().default(0),
    dots: integer('dots').notNull().default(0),
    widesNoBalls: smallint('wides_no_balls').notNull().default(0),
    bestWickets: smallint('best_wickets').notNull().default(0),
    bestRuns: smallint('best_runs').notNull().default(0), // best figures = bestWickets/bestRuns
    threeWicketHauls: smallint('three_wicket_hauls').notNull().default(0),
    // Awards
    playerOfMatch: smallint('player_of_match').notNull().default(0),

    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  t => [index('player_stats_arena_runs_idx').on(t.arenaId, t.runs), index('player_stats_arena_wkts_idx').on(t.arenaId, t.wickets)],
)

export type PlayerStats = typeof playerStats.$inferSelect
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert

