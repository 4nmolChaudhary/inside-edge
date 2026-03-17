'use server'
import { db } from '@/db'
import { team } from '@/db/schemas'
import { eq } from 'drizzle-orm'

export const getTeams = async () => {
  return await db.select().from(team)
}

export const getTeamById = async (id: string) => {
  const result = await db.select().from(team).where(eq(team.id, id))
  return result[0] ?? null
}

export const addTeam = async ({ name, image }: { name: string; image: number }) => {
  return await db.insert(team).values({
    id: crypto.randomUUID(),
    name,
    logo: String(image),
    createdAt: new Date(),
    updatedAt: new Date(),
    shortName: name.slice(0, 3).toUpperCase(),
  })
}

export const updateTeam = async (id: string, data: { name: string; logo: number }) => {
  return await db
    .update(team)
    .set({
      name: data.name,
      shortName: data.name.slice(0, 3).toUpperCase(),
      logo: String(data.logo),
      updatedAt: new Date(),
    })
    .where(eq(team.id, id))
}
