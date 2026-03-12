'use server'
import { db } from '@/db'
import { user } from '@/db/schemas'

export const getUsers = async () => {
  return await db.select().from(user)
}
