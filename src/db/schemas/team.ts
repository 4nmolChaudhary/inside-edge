import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const team = pgTable('team', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  logo: text('logo'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
