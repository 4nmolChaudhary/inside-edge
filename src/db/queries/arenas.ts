'use server'

import { cookies } from 'next/headers'
import { db } from '@/db'
import { arenas } from '@/db/schemas'
import { eq } from 'drizzle-orm'
import { cookieName, cookiePrefix, sessionMaxAge } from '@/constants/cookies'

export const getArenaByCode = async (code: string) => {
  const result = await db.select().from(arenas).where(eq(arenas.code, code))
  return result[0] ?? null
}

export const addArena = async ({ code }: { code: string }) => {
  const result = await db.insert(arenas).values({ code }).returning({ id: arenas.id, code: arenas.code })
  return result[0]
}

export const verifyArenaCode = async (code: string) => {
  const arena = await getArenaByCode(code)
  if (!arena) return null

  const cookieStore = await cookies()
  cookieStore.set(`${cookiePrefix}.${cookieName}`, arena.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: sessionMaxAge,
  })

  return { id: arena.id, code: arena.code }
}

