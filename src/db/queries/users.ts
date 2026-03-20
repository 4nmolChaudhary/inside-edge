'use server'
import { db } from '@/db'
import { user } from '@/db/schemas'
import { eq } from 'drizzle-orm'

import { USER_ROLES } from '@/constants/player'

export const getUsers = async () => {
  return await db.select().from(user).where(eq(user.role, USER_ROLES.PLAYER))
}

export const updateUser = async (id: string, updates: Partial<typeof user.$inferInsert>) => {
  return await db.update(user).set(updates).where(eq(user.id, id))
}
