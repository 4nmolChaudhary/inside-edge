import { pgTable, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core'
import { USER_ROLES } from '@/constants/player'

export const user = pgTable('user', {
  id: text('id').primaryKey(),

  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),

  image: text('image'),

  role: text('role').default(USER_ROLES.PLAYER).notNull(),

  jerseyNumber: integer('jersey_number'),

  age: integer('age'),
  nationality: text('nationality'),

  playingRole: text('playing_role'),
  battingStyle: text('batting_style'),
  bowlingStyle: text('bowling_style'),

  height: integer('height'),
  weight: integer('weight'),
  gender: text('gender'),

  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})
