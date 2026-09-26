'use server'

import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { teams } from '@/db/schemas'
import { isAuthorized } from '@/lib/authorize'

const UNIQUE_VIOLATION = '23505'

export const getTeamsByArena = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db.select().from(teams).where(eq(teams.arenaId, arenaId)).orderBy(asc(teams.name))
}

const newTeamSchema = z.object({
  arenaId: z.uuid('Invalid arena'),
  name: z.string().trim().min(1, 'Team name is required').max(60, 'Team name is too long'),
  shortName: z
    .string()
    .trim()
    .max(6, 'Short name can be at most 6 characters')
    .transform(value => value.toUpperCase() || null),
})

export const addTeam = async (input: { arenaId: string; name: string; shortName: string }) => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }

  const parsed = newTeamSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const [team] = await db.insert(teams).values(parsed.data).returning()
    return { team }
  } catch (error) {
    const code = (error as { code?: string; cause?: { code?: string } })?.cause?.code ?? (error as { code?: string })?.code
    if (code === UNIQUE_VIOLATION) return { error: 'Team name already exists' }
    return { error: 'Could not add team' }
  }
}
