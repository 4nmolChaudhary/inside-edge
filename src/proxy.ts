import { NextRequest, NextResponse } from 'next/server'

import { cookies } from 'next/headers'
import { cookieName, cookiePrefix } from '@/constants/cookies'

const PUBLIC_PATHS = ['/', '/arena']

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(`${cookiePrefix}.${cookieName}`)
  const isLoggedIn = !!sessionCookie?.value

  if (isLoggedIn || PUBLIC_PATHS.includes(request.nextUrl.pathname)) return NextResponse.next()

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
