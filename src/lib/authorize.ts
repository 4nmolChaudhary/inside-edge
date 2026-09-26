'use server'

import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

import { authorizeCookieName, authorizeMaxAge } from '@/constants/cookies'

const TIME_ZONE = 'Asia/Kolkata'

const todaysCode = () => new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date()).replaceAll('/', '')

const sign = (expiresAt: string) => createHmac('sha256', process.env.BETTER_AUTH_SECRET!).update(expiresAt).digest('hex')

export const authorize = async (code: string) => {
  if (code !== todaysCode()) return false

  const expiresAt = String(Date.now() + authorizeMaxAge * 1000)
  const cookieStore = await cookies()
  cookieStore.set(authorizeCookieName, `${expiresAt}.${sign(expiresAt)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: authorizeMaxAge,
  })
  return true
}

export const isAuthorized = async () => {
  const cookieStore = await cookies()
  const value = cookieStore.get(authorizeCookieName)?.value
  if (!value) return false

  const [expiresAt, signature] = value.split('.')
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false

  const expected = Buffer.from(sign(expiresAt))
  const received = Buffer.from(signature)
  return expected.length === received.length && timingSafeEqual(expected, received)
}

