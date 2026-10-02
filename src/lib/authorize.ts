'use server'

import { createHmac, randomUUID, timingSafeEqual } from 'crypto'
import { and, eq, gt, lt, or, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'

import { db } from '@/db'
import { authorizationLock } from '@/db/schemas'
import { authorizeCookieName, authorizeMaxAge } from '@/constants/cookies'

const TIME_ZONE = 'Asia/Kolkata'

export type AuthorizeResult = 'ok' | 'invalid' | 'taken'

const todaysCode = () => new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date()).replaceAll('/', '')

const sign = (payload: string) => createHmac('sha256', process.env.AUTH_SECRET!).update(payload).digest('hex')

// Returns the session id from the cookie if its signature is valid and it hasn't expired.
const readSessionId = async () => {
  const cookieStore = await cookies()
  const value = cookieStore.get(authorizeCookieName)?.value
  if (!value) return null

  const [sessionId, expiresAt, signature] = value.split('.')
  if (!sessionId || !expiresAt || !signature || Number(expiresAt) < Date.now()) return null

  const expected = Buffer.from(sign(`${sessionId}.${expiresAt}`))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  return sessionId
}

export const authorize = async (code: string): Promise<AuthorizeResult> => {
  if (code !== todaysCode()) return 'invalid'

  // Re-authorizing from the same browser keeps its session (and refreshes the expiry).
  const sessionId = (await readSessionId()) ?? randomUUID()
  const expiresAt = new Date(Date.now() + authorizeMaxAge * 1000)

  // Atomic claim: only succeeds if nobody holds the lock, the holder's lock expired, or we are the holder.
  const [claimed] = await db
    .insert(authorizationLock)
    .values({ id: 1, sessionId, expiresAt })
    .onConflictDoUpdate({
      target: authorizationLock.id,
      set: { sessionId, expiresAt },
      setWhere: or(lt(authorizationLock.expiresAt, sql`now()`), eq(authorizationLock.sessionId, sessionId)),
    })
    .returning({ id: authorizationLock.id })
  if (!claimed) return 'taken'

  const payload = `${sessionId}.${expiresAt.getTime()}`
  const cookieStore = await cookies()
  cookieStore.set(authorizeCookieName, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: authorizeMaxAge,
  })
  return 'ok'
}

export const isAuthorized = async () => {
  const sessionId = await readSessionId()
  if (!sessionId) return false

  const [holder] = await db
    .select({ id: authorizationLock.id })
    .from(authorizationLock)
    .where(and(eq(authorizationLock.id, 1), eq(authorizationLock.sessionId, sessionId), gt(authorizationLock.expiresAt, sql`now()`)))
  return !!holder
}

// Frees the lock so someone else can authorize before the current holder expires.
export const deauthorize = async () => {
  const sessionId = await readSessionId()
  if (sessionId) await db.delete(authorizationLock).where(eq(authorizationLock.sessionId, sessionId))

  const cookieStore = await cookies()
  cookieStore.delete(authorizeCookieName)
}
