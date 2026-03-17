import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { customSession } from 'better-auth/plugins'

import { db } from '@/db'
import { verification, session, account } from '@/db/schemas/auth'
import { user as userTable } from '@/db/schemas/user'
import { eq } from 'drizzle-orm'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user: userTable, verification, session, account },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  plugins: [
    nextCookies(),
    customSession(async ({ user, session }) => {
      const userData = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id))
        .then(([user]) => user)
      return {
        user: userData || user,
        session,
      }
    }),
  ],
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.3:3000'],
})
