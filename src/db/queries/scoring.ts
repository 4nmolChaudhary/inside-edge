'use server'

import { and, eq, inArray, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { db } from '@/db'
import { matches, playerStats, players, teams } from '@/db/schemas'
import type { Match } from '@/db/schemas'
import { isAuthorized } from '@/lib/authorize'
import { SUPER_OVER_OVERS, computeInningsFigures, computeResult, computeSummaryDelta, computeSuperOverResult, decodeBall, decodeRetire, mergeFigures, replayInnings, suggestPlayerOfMatch, validateBall, validateBallAgainstState, validateRetireAgainstState } from '@/lib/scoring'
import type { InningsNumber, MatchSnapshot, PlayerFigures, ScorerMatch, ScorerTeam, ScoringActionResult } from '@/lib/scoring'

const CONFLICT = 'Scoreboard was updated elsewhere'

const snapshotColumns = {
  status: matches.status,
  currentInnings: matches.currentInnings,
  inn1Balls: matches.inn1Balls,
  inn2Balls: matches.inn2Balls,
  super1Balls: matches.super1Balls,
  super2Balls: matches.super2Balls,
  resultText: matches.resultText,
  playerOfMatchId: matches.playerOfMatchId,
}

const snapshotOf = (match: MatchSnapshot): MatchSnapshot => ({ status: match.status, currentInnings: match.currentInnings, inn1Balls: match.inn1Balls, inn2Balls: match.inn2Balls, super1Balls: match.super1Balls, super2Balls: match.super2Balls, resultText: match.resultText, playerOfMatchId: match.playerOfMatchId })

const ids = z.object({ matchId: z.uuid('Invalid match'), arenaId: z.uuid('Invalid arena') })

const loadMatch = async (matchId: string, arenaId: string) => {
  const [match] = await db
    .select()
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId)))
  return match ?? null
}

const inningsOf = (match: Match): InningsNumber => (match.currentInnings === 4 ? 4 : match.currentInnings === 3 ? 3 : match.currentInnings === 2 ? 2 : 1)

// Which squad is batting / bowling in an innings, and where its ball tokens live.
// Innings 3 (super over) is batted by the team that batted second in the match, innings 4 by the team that batted first.
const inningsContext = (match: Match, innings: InningsNumber) => {
  const battingTeamId = innings === 1 || innings === 4 ? match.battingFirstId : match.battingFirstId === match.teamAId ? match.teamBId : match.teamAId
  const battingIsA = battingTeamId === match.teamAId
  const key = ({ 1: 'inn1Balls', 2: 'inn2Balls', 3: 'super1Balls', 4: 'super2Balls' } as const)[innings]
  return {
    battingIsA,
    batting: battingIsA ? match.teamAPlayerIds : match.teamBPlayerIds,
    bowling: battingIsA ? match.teamBPlayerIds : match.teamAPlayerIds,
    tokens: match[key],
    key,
    column: matches[key],
    overs: innings >= 3 ? SUPER_OVER_OVERS : match.overs,
    isSuper: innings >= 3,
  }
}

const firstInningsRuns = (match: Match) => (match.battingFirstId === match.teamAId ? match.teamARuns : match.teamBRuns)
// the chasing innings (2 in the match, 4 in the super over) needs one more than the innings before it
const targetFor = (match: Match, innings: InningsNumber) => {
  if (innings === 2) return firstInningsRuns(match) + 1
  if (innings === 4) {
    const first = inningsContext(match, 3)
    return replayInnings(first.tokens, first.batting, first.bowling, first.overs).totals.runs + 1
  }
  return null
}

const conflict = async (matchId: string, arenaId: string): Promise<ScoringActionResult> => {
  const fresh = await loadMatch(matchId, arenaId)
  return { error: CONFLICT, snapshot: fresh ? snapshotOf(fresh) : undefined }
}

// Read model for the scorer and the live view. Squads stay index-aligned with the match arrays.
export const getScorerMatch = async (id: string, arenaId: string): Promise<ScorerMatch | null> => {
  if (!z.uuid().safeParse(id).success || !z.uuid().safeParse(arenaId).success) return null
  const match = await loadMatch(id, arenaId)
  if (!match || !match.battingFirstId) return null

  const teamRows = await db
    .select()
    .from(teams)
    .where(inArray(teams.id, [match.teamAId, match.teamBId]))
  const playerIds = [...match.teamAPlayerIds, ...match.teamBPlayerIds]
  const playerRows = playerIds.length ? await db.select().from(players).where(and(eq(players.arenaId, arenaId), inArray(players.id, playerIds))) : []
  const playerById = new Map(playerRows.map(player => [player.id, player]))

  const buildTeam = (teamId: string, squadIds: string[]): ScorerTeam | null => {
    const team = teamRows.find(row => row.id === teamId)
    if (!team) return null
    return {
      id: team.id,
      name: team.name,
      shortName: team.shortName,
      logoUrl: team.logoUrl,
      squad: squadIds.map(playerId => {
        const player = playerById.get(playerId)
        return { id: playerId, name: player ? `${player.firstName} ${player.lastName}`.trim() : 'Unknown player', number: player?.number ?? null }
      }),
    }
  }

  const teamA = buildTeam(match.teamAId, match.teamAPlayerIds)
  const teamB = buildTeam(match.teamBId, match.teamBPlayerIds)
  if (!teamA || !teamB) return null

  const [battingFirst, bowlingFirst] = match.battingFirstId === match.teamAId ? [teamA, teamB] : [teamB, teamA]
  return { id: match.id, overs: match.overs, battingFirst, bowlingFirst, snapshot: snapshotOf(match) }
}

const recordBallSchema = ids.extend({ token: z.string().min(2).max(12), expectedLength: z.number().int().min(0) })

export const recordBall = async (input: { matchId: string; arenaId: string; token: string; expectedLength: number }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = recordBallSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId, token, expectedLength } = parsed.data

  const match = await loadMatch(matchId, arenaId)
  if (!match) return { error: 'Match not found' }
  if (match.status !== 'live') return { error: 'Match is not live', snapshot: snapshotOf(match) }

  const innings = inningsOf(match)
  const context = inningsContext(match, innings)
  if (context.tokens.length !== expectedLength) return { error: CONFLICT, snapshot: snapshotOf(match) }

  // a token is either a delivery or a between-ball retirement (R<i> / X<i>)
  const retire = decodeRetire(token)
  const ball = retire ? null : decodeBall(token)
  if (!retire && !ball) return { error: 'Invalid ball' }
  if (ball) {
    const invalid = validateBall(ball, context.batting.length, context.bowling.length)
    if (invalid) return { error: invalid }
  }
  const state = replayInnings(context.tokens, context.batting, context.bowling, context.overs, targetFor(match, innings))
  const stateInvalid = retire ? validateRetireAgainstState(retire, state, context.batting.length) : validateBallAgainstState(ball!, state)
  if (stateInvalid) return { error: stateInvalid, snapshot: snapshotOf(match) }

  const delta = computeSummaryDelta(token)!
  const ballsSet = { [context.key]: sql<string[]>`array_append(${context.column}, ${token})` }
  // the team score cache only covers the match itself, never the super over
  const scoreSet = context.isSuper
    ? {}
    : context.battingIsA
      ? { teamARuns: sql<number>`${matches.teamARuns} + ${delta.runs}`, teamAWickets: sql<number>`${matches.teamAWickets} + ${delta.wickets}`, teamABalls: sql<number>`${matches.teamABalls} + ${delta.balls}` }
      : { teamBRuns: sql<number>`${matches.teamBRuns} + ${delta.runs}`, teamBWickets: sql<number>`${matches.teamBWickets} + ${delta.wickets}`, teamBBalls: sql<number>`${matches.teamBBalls} + ${delta.balls}` }
  const ballsColumn = context.column

  try {
    // single atomic UPDATE; the cardinality check is the optimistic-concurrency guard
    const [updated] = await db
      .update(matches)
      .set({ ...ballsSet, ...scoreSet })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live'), eq(matches.currentInnings, innings), sql`cardinality(${ballsColumn}) = ${expectedLength}`))
      .returning(snapshotColumns)
    if (!updated) return conflict(matchId, arenaId)
    return { snapshot: updated }
  } catch {
    return { error: 'Could not save ball' }
  }
}

export const undoLastBall = async (input: { matchId: string; arenaId: string; expectedLength: number }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = ids.extend({ expectedLength: z.number().int().min(1) }).safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId, expectedLength } = parsed.data

  const match = await loadMatch(matchId, arenaId)
  if (!match) return { error: 'Match not found' }
  if (match.status !== 'live') return { error: 'Match is not live', snapshot: snapshotOf(match) }

  const innings = inningsOf(match)
  const context = inningsContext(match, innings)
  if (context.tokens.length !== expectedLength) return { error: CONFLICT, snapshot: snapshotOf(match) }

  // recompute the summary from the shortened log instead of decrementing blindly
  const remaining = context.tokens.slice(0, -1)
  const state = replayInnings(remaining, context.batting, context.bowling, context.overs)
  const { runs, wickets, balls } = state.totals

  const ballsSet = { [context.key]: remaining }
  const scoreSet = context.isSuper ? {} : context.battingIsA ? { teamARuns: runs, teamAWickets: wickets, teamABalls: balls } : { teamBRuns: runs, teamBWickets: wickets, teamBBalls: balls }
  const ballsColumn = context.column

  try {
    const [updated] = await db
      .update(matches)
      .set({ ...ballsSet, ...scoreSet })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live'), eq(matches.currentInnings, innings), sql`cardinality(${ballsColumn}) = ${expectedLength}`))
      .returning(snapshotColumns)
    if (!updated) return conflict(matchId, arenaId)
    return { snapshot: updated }
  } catch {
    return { error: 'Could not undo ball' }
  }
}

export const endInnings = async (input: { matchId: string; arenaId: string }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = ids.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId } = parsed.data

  try {
    const [updated] = await db
      .update(matches)
      .set({ currentInnings: sql`${matches.currentInnings} + 1` }) // 1 -> 2 and 3 -> 4
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live'), inArray(matches.currentInnings, [1, 3])))
      .returning(snapshotColumns)
    if (!updated) return conflict(matchId, arenaId)
    return { snapshot: updated }
  } catch {
    return { error: 'Could not end innings' }
  }
}

// A tied match can go to a super over: one over each, the side that batted second in the match bats first.
export const startSuperOver = async (input: { matchId: string; arenaId: string }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = ids.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId } = parsed.data

  const match = await loadMatch(matchId, arenaId)
  if (!match) return { error: 'Match not found' }
  if (match.status !== 'live') return { error: 'Match is not live', snapshot: snapshotOf(match) }
  if (match.currentInnings !== 2) return { error: 'A super over can only follow the match innings', snapshot: snapshotOf(match) }

  const first = inningsContext(match, 1)
  const second = inningsContext(match, 2)
  const inn1 = replayInnings(first.tokens, first.batting, first.bowling, first.overs)
  const inn2 = replayInnings(second.tokens, second.batting, second.bowling, second.overs, inn1.totals.runs + 1)
  if (inn1.totals.runs !== inn2.totals.runs) return { error: 'The match is not tied', snapshot: snapshotOf(match) }

  try {
    const [updated] = await db
      .update(matches)
      .set({ currentInnings: 3 })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live'), eq(matches.currentInnings, 2), sql`cardinality(${matches.inn2Balls}) = ${match.inn2Balls.length}`))
      .returning(snapshotColumns)
    if (!updated) return conflict(matchId, arenaId)
    return { snapshot: updated }
  } catch {
    return { error: 'Could not start the super over' }
  }
}

const excluded = (column: AnyPgColumn) => sql.raw(`excluded."${column.name}"`)
const add = (column: AnyPgColumn) => sql`${column} + ${excluded(column)}`

// The Player of the Match is always the top performer by the points formula (no manual pick, so no bias).
export const completeMatch = async (input: { matchId: string; arenaId: string }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = ids.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId } = parsed.data

  try {
    return await db.transaction(async (tx): Promise<ScoringActionResult> => {
      const [match] = await tx
        .select()
        .from(matches)
        .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId)))
        .for('update')
      if (!match) return { error: 'Match not found' }
      if (match.status !== 'live') return { error: 'Match is not live', snapshot: snapshotOf(match) }
      // innings 2 ends the match (a tie stays a tie), innings 4 ends the super over
      if ((match.currentInnings !== 2 && match.currentInnings !== 4) || !match.battingFirstId) return { error: 'Finish the first innings first', snapshot: snapshotOf(match) }

      const teamRows = await tx
        .select({ id: teams.id, name: teams.name })
        .from(teams)
        .where(inArray(teams.id, [match.teamAId, match.teamBId]))
      const nameOf = (teamId: string) => teamRows.find(team => team.id === teamId)?.name ?? 'Team'

      const first = inningsContext(match, 1)
      const second = inningsContext(match, 2)
      const inn1 = replayInnings(first.tokens, first.batting, first.bowling, first.overs)
      const inn2 = replayInnings(second.tokens, second.batting, second.bowling, second.overs, inn1.totals.runs + 1)

      const teamA = first.battingIsA ? { state: inn1, squadSize: first.batting.length } : { state: inn2, squadSize: second.batting.length }
      const teamB = first.battingIsA ? { state: inn2, squadSize: second.batting.length } : { state: inn1, squadSize: first.batting.length }
      const regular = computeResult({
        battingFirstId: match.battingFirstId,
        teamA: { id: match.teamAId, name: nameOf(match.teamAId), runs: teamA.state.totals.runs, wickets: teamA.state.totals.wickets, squadSize: teamA.squadSize },
        teamB: { id: match.teamBId, name: nameOf(match.teamBId), runs: teamB.state.totals.runs, wickets: teamB.state.totals.wickets, squadSize: teamB.squadSize },
      })

      // a super over only ever decides a tie; its figures never reach player_stats
      let { winnerId, resultText } = regular
      if (match.currentInnings === 4) {
        const superFirst = inningsContext(match, 3)
        const superSecond = inningsContext(match, 4)
        const super1 = replayInnings(superFirst.tokens, superFirst.batting, superFirst.bowling, superFirst.overs)
        const super2 = replayInnings(superSecond.tokens, superSecond.batting, superSecond.bowling, superSecond.overs, super1.totals.runs + 1)
        const superTeam = (teamId: string, state: typeof super1) => ({ id: teamId, name: nameOf(teamId), runs: state.totals.runs, wickets: state.totals.wickets })
        const decided = computeSuperOverResult({ first: superTeam(match.battingFirstId === match.teamAId ? match.teamBId : match.teamAId, super1), second: superTeam(match.battingFirstId, super2) })
        winnerId = decided.winnerId
        resultText = decided.resultText.slice(0, 100)
      }

      const squadIds = [...match.teamAPlayerIds, ...match.teamBPlayerIds]
      const otherTeamId = match.battingFirstId === match.teamAId ? match.teamBId : match.teamAId
      const [top] = suggestPlayerOfMatch({ battingFirst: { teamId: match.battingFirstId, playerIds: first.batting }, bowlingFirst: { teamId: otherTeamId, playerIds: second.batting }, winnerId }, inn1, inn2)
      const playerOfMatchId = top?.playerId ?? null

      if (!match.statsApplied) {
        const figures = new Map<string, PlayerFigures>()
        mergeFigures(figures, computeInningsFigures(inn1, first.batting, first.bowling))
        mergeFigures(figures, computeInningsFigures(inn2, second.batting, second.bowling))

        const rows = squadIds.map(playerId => ({ playerId, arenaId, matches: 1, playerOfMatch: playerId === playerOfMatchId ? 1 : 0, ...figures.get(playerId) }))
        const betterBest = sql`(${excluded(playerStats.bestWickets)} > ${playerStats.bestWickets} OR (${excluded(playerStats.bestWickets)} = ${playerStats.bestWickets} AND ${excluded(playerStats.bestWickets)} > 0 AND ${excluded(playerStats.bestRuns)} < ${playerStats.bestRuns}))`
        const newHighScore = sql`${excluded(playerStats.highScore)} > ${playerStats.highScore}`

        await tx
          .insert(playerStats)
          .values(rows)
          .onConflictDoUpdate({
            target: playerStats.playerId,
            set: {
              matches: add(playerStats.matches),
              innings: add(playerStats.innings),
              runs: add(playerStats.runs),
              ballsFaced: add(playerStats.ballsFaced),
              fours: add(playerStats.fours),
              sixes: add(playerStats.sixes),
              outs: add(playerStats.outs),
              highScore: sql`GREATEST(${playerStats.highScore}, ${excluded(playerStats.highScore)})`,
              highScoreNotOut: sql`CASE WHEN ${newHighScore} THEN ${excluded(playerStats.highScoreNotOut)} ELSE ${playerStats.highScoreNotOut} END`,
              fifties: add(playerStats.fifties),
              hundreds: add(playerStats.hundreds),
              ducks: add(playerStats.ducks),
              ballsBowled: add(playerStats.ballsBowled),
              runsConceded: add(playerStats.runsConceded),
              wickets: add(playerStats.wickets),
              maidens: add(playerStats.maidens),
              dots: add(playerStats.dots),
              widesNoBalls: add(playerStats.widesNoBalls),
              bestWickets: sql`CASE WHEN ${betterBest} THEN ${excluded(playerStats.bestWickets)} ELSE ${playerStats.bestWickets} END`,
              bestRuns: sql`CASE WHEN ${betterBest} THEN ${excluded(playerStats.bestRuns)} ELSE ${playerStats.bestRuns} END`,
              threeWicketHauls: add(playerStats.threeWicketHauls),
              playerOfMatch: add(playerStats.playerOfMatch),
              updatedAt: sql`now()`,
            },
          })
      }

      const [updated] = await tx
        .update(matches)
        .set({ status: 'completed', completedAt: new Date(), winnerId, resultText, playerOfMatchId, statsApplied: true })
        .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live')))
        .returning(snapshotColumns)
      if (!updated) return { error: CONFLICT, snapshot: snapshotOf(match) }
      return { snapshot: updated }
    })
  } catch {
    return { error: 'Could not complete match' }
  }
}

export const abandonMatch = async (input: { matchId: string; arenaId: string }): Promise<ScoringActionResult> => {
  if (!(await isAuthorized())) return { error: 'Not authorized' }
  const parsed = ids.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { matchId, arenaId } = parsed.data

  try {
    const [updated] = await db
      .update(matches)
      .set({ status: 'abandoned', completedAt: new Date(), resultText: 'Match abandoned' })
      .where(and(eq(matches.id, matchId), eq(matches.arenaId, arenaId), eq(matches.status, 'live')))
      .returning(snapshotColumns)
    if (!updated) return conflict(matchId, arenaId)
    return { snapshot: updated }
  } catch {
    return { error: 'Could not abandon match' }
  }
}
