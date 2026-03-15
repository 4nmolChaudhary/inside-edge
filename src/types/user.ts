import { user } from '@/db/schemas'

export type User = {
  name?: string | null
  age?: number | null
  jerseyNumber?: number | null
  battingStyle?: string | null
  bowlingStyle?: string | null
  playingRole?: string | null
  image?: string | null
  id: string
}
export type UpdateUserInput = {
  id: string
  updates: Partial<typeof user.$inferInsert>
}
