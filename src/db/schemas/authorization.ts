import { check, integer, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// Single-row table: the row with id = 1 holds the one currently authorized session.
export const authorizationLock = pgTable(
  'authorization_lock',
  {
    id: integer('id').primaryKey().default(1),
    sessionId: uuid('session_id').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  table => [check('authorization_lock_single_row', sql`${table.id} = 1`)],
)
