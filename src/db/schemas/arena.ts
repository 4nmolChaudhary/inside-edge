import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

export const arenas = pgTable('arenas', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 6 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
