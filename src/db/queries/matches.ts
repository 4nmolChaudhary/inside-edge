'use server'

import { and, desc, eq, inArray } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { db } from '@/db'
import { matches, players, teams } from '@/db/schemas'
import { isAuthorized } from '@/lib/authorize'

const MIN_SQUAD_SIZE = 2

const teamA = alias(teams, 'match_team_a')
const teamB = alias(teams, 'match_team_b')

const matchListSelect = {
  id: matches.id,
  overs: matches.overs,
  status: matches.status,
  currentInnings: matches.currentInnings,
  teamARuns: matches.teamARuns,
  teamAWickets: matches.teamAWickets,
  teamABalls: matches.teamABalls,
  teamBRuns: matches.teamBRuns,
  teamBWickets: matches.teamBWickets,
  teamBBalls: matches.teamBBalls,
  battingFirstId: matches.battingFirstId,
  resultText: matches.resultText,
  winnerId: matches.winnerId,
  createdAt: matches.createdAt,
  startedAt: matches.startedAt,
  completedAt: matches.completedAt,
  teamA: { id: teamA.id, name: teamA.name, shortName: teamA.shortName, logoUrl: teamA.logoUrl },
  teamB: { id: teamB.id, name: teamB.name, shortName: teamB.shortName, logoUrl: teamB.logoUrl },
}

export const getLiveMatchesByArena = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db
    .select(matchListSelect)
    .from(matches)
    .innerJoin(teamA, eq(matches.teamAId, teamA.id))
    .innerJoin(teamB, eq(matches.teamBId, teamB.id))
    .where(and(eq(matches.arenaId, arenaId), eq(matches.status, 'live')))
    .orderBy(desc(matches.startedAt))
}

export const getPastMatchesByArena = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db
    .select(matchListSelect)
    .from(matches)
    .innerJoin(teamA, eq(matches.teamAId, teamA.id))
    .innerJoin(teamB, eq(matches.teamBId, teamB.id))
    .where(and(eq(matches.arenaId, arenaId), inArray(matches.status, ['completed', 'abandoned'])))
    .orderBy(desc(matches.completedAt), desc(matches.createdAt))
}

export const getSetupMatchesByArena = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db
    .select(matchListSelect)
    .from(matches)
    .innerJoin(teamA, eq(matches.teamAId, teamA.id))
    .innerJoin(teamB, eq(matches.teamBId, teamB.id))
    .where(and(eq(matches.arenaId, arenaId), eq(matches.status, 'setup')))
    .orderBy(desc(matches.createdAt))
}

// Raw row (no joins), scoped to arena. Used to resume the setup wizard.
export const getMatchById = async (id: string, arenaId: string) => {
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(arenaId).success) return null
  const result = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, id), eq(matches.arenaId, arenaId)))
  return result[0] ?? null
}

// Joined + full squads, for the read-only details page and the live score page.
export const getMatchDetail = async (id: string, arenaId: string) => {
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(arenaId).success) return null

  const [match] = await db
    .select({
      ...matchListSelect,
      teamAPlayerIds: matches.teamAPlayerIds,
      teamBPlayerIds: matches.teamBPlayerIds,
      teamACaptainId: matches.teamACaptainId,
      teamBCaptainId: matches.teamBCaptainId,
      tossWinnerId: matches.tossWinnerId,
      tossDecision: matches.tossDecision,
    })
    .from(matches)
    .innerJoin(teamA, eq(matches.teamAId, teamA.id))
    .innerJoin(teamB, eq(matches.teamBId, teamB.id))
    .where(and(eq(matches.id, id), eq(matches.arenaId, arenaId)))

  if (!match) return null

  const playerIds = [...match.teamAPlayerIds, ...match.teamBPlayerIds]
  const roster = playerIds.length ? await db.select().from(players).where(inArray(players.id, playerIds)) : []
  const byId = new Map(roster.map(player => [player.id, player]))

  return {
    ...match,
    teamARoster: match.teamAPlayerIds.map(id => byId.get(id)).filter((player): player is (typeof roster)[number] => !!player),
    teamBRoster: match.teamBPlayerIds.map(id => byId.get(id)).filter((player): player is (typeof roster)[number] => !!player),
  }
}

const newMatchSchema = z
  .object({
    arenaId: z.uuid('Invalid arena'),
    teamAId: z.uuid('Select Team A'),
    teamBId: z.uuid('Select Team B'),
    overs: z.number('Overs must be a whole number').int('Overs must be a whole number').min(1, 'Overs must be between 1 and 50').max(50, 'Overs must be between 1 and 50'),
  })
  .refine(data => data.teamAId !== data.teamBId, { message: 'Teams must be different', path: ['teamBId'] })

export const createMatch = async (input: { arenaId: string; teamAId: string; teamBId: string; overs: number }) => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }

  const parsed = newMatchSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { arenaId, teamAId, teamBId, overs } = parsed.data

  const ownTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.arenaId, arenaId), inArray(teams.id, [teamAId, teamBId])))
  if (ownTeams.length !== 2) return { error: 'Selected teams are invalid' }

  try {
    const [match] = await db.insert(matches).values({ arenaId, teamAId, teamBId, overs }).returning()
    return { match }
  } catch {
    return { error: 'Could not create match' }
  }
}

const squadsSchema = z.object({
  matchId: z.uuid('Invalid match'),
  arenaId: z.uuid('Invalid arena'),
  teamAPlayerIds: z.array(z.uuid()).min(MIN_SQUAD_SIZE, 'Team A needs at least 2 players'),
  teamBPlayerIds: z.array(z.uuid()).min(MIN_SQUAD_SIZE, 'Team B needs at least 2 players'),
  teamACaptainId: z.uuid().nullable(),
  teamBCaptainId: z.uuid().nullable(),
})

export const updateMatchSquads = async (input: { matchId: string; arenaId: string; teamAPlayerIds: string[]; teamBPlayerIds: string[]; teamACaptainId: string | null; teamBCaptainId: string | null }) => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }

  const parsed = squadsSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId, teamAPlayerIds, teamBPlayerIds, teamACaptainId, teamBCaptainId } = parsed.data

  if (teamAPlayerIds.some(id => teamBPlayerIds.includes(id))) return { error: 'A player can only be on one team' }
  if (teamACaptainId && !teamAPlayerIds.includes(teamACaptainId)) return { error: 'Team A captain must be in the squad' }
  if (teamBCaptainId && !teamBPlayerIds.includes(teamBCaptainId)) return { error: 'Team B captain must be in the squad' }

  const [match] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'setup')))
  if (!match) return { error: 'Match not found' }

  // Arrays have no FK, so every id must be checked against the current arena's players here.
  const allPlayerIds = [...new Set([...teamAPlayerIds, ...teamBPlayerIds])]
  const ownPlayers = await db
    .select({ id: players.id })
    .from(players)
    .where(and(eq(players.arenaId, arenaId), inArray(players.id, allPlayerIds)))
  if (ownPlayers.length !== allPlayerIds.length) return { error: 'Selected players are invalid' }

  try {
    const [updated] = await db
      .update(matches)
      .set({ teamAPlayerIds, teamBPlayerIds, teamACaptainId, teamBCaptainId })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'setup')))
      .returning()
    return { match: updated }
  } catch {
    return { error: 'Could not update squads' }
  }
}

const tossSchema = z.object({
  matchId: z.uuid('Invalid match'),
  arenaId: z.uuid('Invalid arena'),
  tossWinnerId: z.uuid('Select the toss winner'),
  tossDecision: z.enum(['bat', 'bowl']),
})

export const updateMatchToss = async (input: { matchId: string; arenaId: string; tossWinnerId: string; tossDecision: 'bat' | 'bowl' }) => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }

  const parsed = tossSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId, tossWinnerId, tossDecision } = parsed.data

  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'setup')))
  if (!match) return { error: 'Match not found' }

  if (match.teamAPlayerIds.length < MIN_SQUAD_SIZE || match.teamBPlayerIds.length < MIN_SQUAD_SIZE) return { error: 'Add players to both teams first' }
  if (tossWinnerId !== match.teamAId && tossWinnerId !== match.teamBId) return { error: 'Toss winner must be one of the two teams' }

  const battingFirstId = tossDecision === 'bat' ? tossWinnerId : tossWinnerId === match.teamAId ? match.teamBId : match.teamAId

  try {
    const [updated] = await db
      .update(matches)
      .set({ tossWinnerId, tossDecision, battingFirstId, status: 'live', startedAt: new Date(), currentInnings: 1 })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'setup')))
      .returning()
    if (!updated) return { error: 'Match already started' }
    return { match: updated }
  } catch {
    return { error: 'Could not start match' }
  }
}
