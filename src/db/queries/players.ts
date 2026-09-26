'use server'

import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { players } from '@/db/schemas'
import { isAuthorized } from '@/lib/authorize'

export const getPlayersByArena = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db.select().from(players).where(eq(players.arenaId, arenaId)).orderBy(asc(players.firstName), asc(players.lastName))
}

const newPlayerSchema = z.object({
  arenaId: z.uuid('Invalid arena'),
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name is too long'),
  number: z.number('Number must be a whole number').int('Number must be a whole number').min(0, 'Number must be between 0 and 99').max(99, 'Number must be between 0 and 99').nullable(),
})

export const addPlayer = async (input: { arenaId: string; firstName: string; lastName: string; number: number | null }) => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }

  const parsed = newPlayerSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const [player] = await db.insert(players).values(parsed.data).returning()
    return { player }
  } catch {
    return { error: 'Could not add player' }
  }
}
