import { pgTable, pgEnum, uuid, varchar, smallint, text, boolean, timestamp, index, check } from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

import { arenas } from '@/db/schemas/arena'
import { teams } from '@/db/schemas/team'
import { players } from '@/db/schemas/player'

export const matchStatus = pgEnum('match_status', ['setup', 'live', 'completed', 'abandoned'])
export const tossDecision = pgEnum('toss_decision', ['bat', 'bowl'])

export const matches = pgTable(
  'matches',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    arenaId: uuid('arena_id')
      .notNull()
      .references(() => arenas.id, { onDelete: 'cascade' }),

    // Step 1: select teams + format
    teamAId: uuid('team_a_id')
      .notNull()
      .references(() => teams.id),
    teamBId: uuid('team_b_id')
      .notNull()
      .references(() => teams.id),
    overs: smallint('overs').notNull(),

    // Step 2: squads, stored as arrays instead of a join table (saves ~22 rows per match)
    // RULE: once status = 'live' these are APPEND-ONLY (never reorder/remove);
    // ball tokens reference players by their index in these arrays.
    teamAPlayerIds: uuid('team_a_player_ids')
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    teamBPlayerIds: uuid('team_b_player_ids')
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    teamACaptainId: uuid('team_a_captain_id').references(() => players.id),
    teamBCaptainId: uuid('team_b_captain_id').references(() => players.id),

    // Step 3: toss
    tossWinnerId: uuid('toss_winner_id').references(() => teams.id),
    tossDecision: tossDecision('toss_decision'),
    battingFirstId: uuid('batting_first_id').references(() => teams.id), // derived from toss, saved for easy reads

    // Step 4: live state
    status: matchStatus('status').notNull().default('setup'),
    currentInnings: smallint('current_innings').notNull().default(1), // 1 or 2

    // Ball-by-ball log, one compact token per delivery (format: see pass3-schema.ts)
    // inn1 = batting_first team, inn2 = the other team
    inn1Balls: text('inn1_balls')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    inn2Balls: text('inn2_balls')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    // Score summary cache, so the fixtures list needs NO joins/aggregation.
    // Updated in the same UPDATE that appends a ball token.
    teamARuns: smallint('team_a_runs').notNull().default(0),
    teamAWickets: smallint('team_a_wickets').notNull().default(0),
    teamABalls: smallint('team_a_balls').notNull().default(0), // legal balls → overs = floor(b/6).(b%6)
    teamBRuns: smallint('team_b_runs').notNull().default(0),
    teamBWickets: smallint('team_b_wickets').notNull().default(0),
    teamBBalls: smallint('team_b_balls').notNull().default(0),

    // Result
    winnerId: uuid('winner_id').references(() => teams.id), // null + completed = tie
    resultText: varchar('result_text', { length: 100 }), // "Tigers won by 12 runs"

    // Guards against adding a match to player_stats twice
    statsApplied: boolean('stats_applied').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  t => [index('matches_arena_status_idx').on(t.arenaId, t.status, t.createdAt), check('matches_diff_teams', sql`${t.teamAId} <> ${t.teamBId}`), check('matches_innings', sql`${t.currentInnings} in (1, 2)`)],
)

export const matchesRelations = relations(matches, ({ one }) => ({
  arena: one(arenas, { fields: [matches.arenaId], references: [arenas.id] }),
  teamA: one(teams, { fields: [matches.teamAId], references: [teams.id], relationName: 'teamA' }),
  teamB: one(teams, { fields: [matches.teamBId], references: [teams.id], relationName: 'teamB' }),
  tossWinner: one(teams, { fields: [matches.tossWinnerId], references: [teams.id], relationName: 'tossWinner' }),
  winner: one(teams, { fields: [matches.winnerId], references: [teams.id], relationName: 'winner' }),
}))

export type Match = typeof matches.$inferSelect
export type NewMatch = typeof matches.$inferInsert
