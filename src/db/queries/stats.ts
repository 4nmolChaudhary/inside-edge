'use server'

import { and, desc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { playerStats, players } from '@/db/schemas'

export const getPotmLeaderboard = async (arenaId: string) => {
  if (!z.uuid().safeParse(arenaId).success) return []
  return db
    .select({ playerId: players.id, firstName: players.firstName, lastName: players.lastName, number: players.number, awards: playerStats.playerOfMatch, matches: playerStats.matches })
    .from(playerStats)
    .innerJoin(players, eq(players.id, playerStats.playerId))
    .where(and(eq(playerStats.arenaId, arenaId), gt(playerStats.playerOfMatch, 0)))
    .orderBy(desc(playerStats.playerOfMatch), desc(playerStats.runs), players.firstName)
    .limit(50)
}

export type StatLeader = { playerId: string; name: string; value: string; detail?: string }
export type StatCategory = { key: string; title: string; leaders: StatLeader[] }

const MIN_BALLS_FOR_STRIKE_RATE = 10
const MIN_BALLS_FOR_ECONOMY = 6

export const getStatLeaders = async (arenaId: string): Promise<StatCategory[]> => {
  if (!z.uuid().safeParse(arenaId).success) return []
  const rows = await db
    .select({ playerId: players.id, firstName: players.firstName, lastName: players.lastName, stats: playerStats })
    .from(playerStats)
    .innerJoin(players, eq(players.id, playerStats.playerId))
    .where(eq(playerStats.arenaId, arenaId))

  const all = rows.map(r => ({ id: r.playerId, name: `${r.firstName} ${r.lastName}`, s: r.stats }))
  type Row = (typeof all)[number]

  const rank = (key: string, title: string, pool: Row[], cmp: (a: Row, b: Row) => number, format: (r: Row) => Pick<StatLeader, 'value' | 'detail'>): StatCategory => ({
    key,
    title,
    leaders: pool
      .sort((a, b) => cmp(a, b) || a.name.localeCompare(b.name))
      .map(r => ({ playerId: r.id, name: r.name, ...format(r) })),
  })

  const strikeRate = (r: Row) => (r.s.runs / r.s.ballsFaced) * 100
  const average = (r: Row) => r.s.runs / r.s.outs
  const economy = (r: Row) => (r.s.runsConceded / r.s.ballsBowled) * 6

  return [
    rank('runs', 'Most runs', all.filter(r => r.s.runs > 0), (a, b) => b.s.runs - a.s.runs, r => ({ value: String(r.s.runs), detail: `${r.s.innings} inns` })),
    rank('sixes', 'Most sixes', all.filter(r => r.s.sixes > 0), (a, b) => b.s.sixes - a.s.sixes, r => ({ value: String(r.s.sixes), detail: `${r.s.innings} inns` })),
    rank('strike-rate', 'Batting strike rate', all.filter(r => r.s.ballsFaced >= MIN_BALLS_FOR_STRIKE_RATE), (a, b) => strikeRate(b) - strikeRate(a), r => ({ value: strikeRate(r).toFixed(1), detail: `${r.s.runs} (${r.s.ballsFaced})` })),
    rank('average', 'Batting average', all.filter(r => r.s.outs > 0), (a, b) => average(b) - average(a), r => ({ value: average(r).toFixed(1), detail: `${r.s.runs} runs, ${r.s.outs} out` })),
    rank('high-score', 'Highest score', all.filter(r => r.s.highScore > 0), (a, b) => b.s.highScore - a.s.highScore, r => ({ value: `${r.s.highScore}${r.s.highScoreNotOut ? '*' : ''}` })),
    rank('wickets', 'Most wickets', all.filter(r => r.s.wickets > 0), (a, b) => b.s.wickets - a.s.wickets, r => ({ value: String(r.s.wickets), detail: `${r.s.runsConceded} runs` })),
    rank('best-bowling', 'Best bowling figures', all.filter(r => r.s.bestWickets > 0), (a, b) => b.s.bestWickets - a.s.bestWickets || a.s.bestRuns - b.s.bestRuns, r => ({ value: `${r.s.bestWickets}/${r.s.bestRuns}` })),
    rank('economy', 'Best economy', all.filter(r => r.s.ballsBowled >= MIN_BALLS_FOR_ECONOMY), (a, b) => economy(a) - economy(b), r => ({ value: economy(r).toFixed(2), detail: `${Math.floor(r.s.ballsBowled / 6)}.${r.s.ballsBowled % 6} ov` })),
  ]
}

export const getPlayerProfile =async (playerId: string, arenaId: string) => {
  if (!z.uuid().safeParse(playerId).success || !z.uuid().safeParse(arenaId).success) return null
  const [player] = await db
    .select()
    .from(players)
    .where(and(eq(players.id, playerId), eq(players.arenaId, arenaId)))
  if (!player) return null
  const [stats] = await db.select().from(playerStats).where(eq(playerStats.playerId, playerId))
  return { player, stats: stats ?? null }
}
