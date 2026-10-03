import type { BatterStat, BowlerStat, InningsState } from './types'

// Every Player of the Match weight lives here so it is easy to tweak.
export const POTM_WEIGHTS = {
  batting: {
    perRun: 1,
    perFour: 1,
    perSix: 2,
    // only the highest milestone applies: 50+ is worth 20 in total, not 30
    milestones: [
      { runs: 50, bonus: 20 },
      { runs: 25, bonus: 10 },
    ],
  },
  strikeRate: { minBalls: 10, highAt: 150, highBonus: 5, lowBelow: 75, lowPenalty: -5 },
  bowling: { perWicket: 20, perMaiden: 5, perDot: 1 },
  economy: { minBalls: 12, lowBelow: 6, lowBonus: 10, highAbove: 10, highPenalty: -5 },
  fielding: { perDismissal: 8 }, // catch, run out or stumping
  winningTeamShare: 0.1, // winners get +10% of their total
}

export type PotmMatch = {
  battingFirst: { teamId: string; playerIds: readonly string[] } // bats in innings 1
  bowlingFirst: { teamId: string; playerIds: readonly string[] } // bats in innings 2
  winnerId: string | null
}

export type PotmBreakdown = { batting: number; strikeRate: number; bowling: number; economy: number; fielding: number; winningTeam: number }

export type PotmCandidate = {
  playerId: string
  teamId: string
  points: number
  breakdown: PotmBreakdown
  winner: boolean
  wickets: number
  runs: number
}

const round = (value: number) => Math.round(value * 100) / 100

const battingPoints = (batter: BatterStat) => {
  const w = POTM_WEIGHTS
  const milestone = w.batting.milestones.find(item => batter.runs >= item.runs)?.bonus ?? 0
  const base = batter.runs * w.batting.perRun + batter.fours * w.batting.perFour + batter.sixes * w.batting.perSix + milestone

  let strikeRate = 0
  if (batter.balls >= w.strikeRate.minBalls) {
    if (batter.strikeRate >= w.strikeRate.highAt) strikeRate = w.strikeRate.highBonus
    else if (batter.strikeRate < w.strikeRate.lowBelow) strikeRate = w.strikeRate.lowPenalty
  }
  return { base, strikeRate }
}

const bowlingPoints = (bowler: BowlerStat) => {
  const w = POTM_WEIGHTS
  const base = bowler.wickets * w.bowling.perWicket + bowler.maidens * w.bowling.perMaiden + bowler.dots * w.bowling.perDot

  let economy = 0
  if (bowler.balls >= w.economy.minBalls) {
    if (bowler.economy < w.economy.lowBelow) economy = w.economy.lowBonus
    else if (bowler.economy > w.economy.highAbove) economy = w.economy.highPenalty
  }
  return { base, economy }
}

// Catches, run outs and stumpings credited to the fielder index of the bowling squad.
const fieldingCounts = (state: InningsState, bowlingIds: readonly string[]) => {
  const counts = new Map<string, number>()
  for (const over of state.overHistory) {
    for (const ball of over.balls) {
      const wicket = ball.wicket
      if (!wicket || wicket.fielder === undefined || !['c', 'r', 's'].includes(wicket.type)) continue
      const id = bowlingIds[wicket.fielder]
      if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }
  return counts
}

// Ranked best-first. Tie-break: points, then the winning team, then wickets, then runs.
export const suggestPlayerOfMatch = (match: PotmMatch, inn1: InningsState, inn2: InningsState): PotmCandidate[] => {
  const rows = new Map<string, PotmCandidate>()
  const teams = [match.battingFirst, match.bowlingFirst]
  for (const team of teams) {
    for (const playerId of team.playerIds) {
      rows.set(playerId, { playerId, teamId: team.teamId, points: 0, breakdown: { batting: 0, strikeRate: 0, bowling: 0, economy: 0, fielding: 0, winningTeam: 0 }, winner: match.winnerId === team.teamId, wickets: 0, runs: 0 })
    }
  }

  const innings = [
    { state: inn1, batting: match.battingFirst.playerIds, bowling: match.bowlingFirst.playerIds },
    { state: inn2, batting: match.bowlingFirst.playerIds, bowling: match.battingFirst.playerIds },
  ]
  for (const { state, batting, bowling } of innings) {
    for (const batter of state.batters) {
      const row = rows.get(batting[batter.index])
      if (!row) continue
      const { base, strikeRate } = battingPoints(batter)
      row.breakdown.batting += base
      row.breakdown.strikeRate += strikeRate
      row.runs += batter.runs
    }
    for (const bowler of state.bowlers) {
      const row = rows.get(bowling[bowler.index])
      if (!row) continue
      const { base, economy } = bowlingPoints(bowler)
      row.breakdown.bowling += base
      row.breakdown.economy += economy
      row.wickets += bowler.wickets
    }
    for (const [playerId, count] of fieldingCounts(state, bowling)) {
      const row = rows.get(playerId)
      if (row) row.breakdown.fielding += count * POTM_WEIGHTS.fielding.perDismissal
    }
  }

  for (const row of rows.values()) {
    const { batting, strikeRate, bowling, economy, fielding } = row.breakdown
    const subtotal = batting + strikeRate + bowling + economy + fielding
    row.breakdown.winningTeam = row.winner ? round(Math.max(subtotal, 0) * POTM_WEIGHTS.winningTeamShare) : 0
    row.points = round(subtotal + row.breakdown.winningTeam)
  }

  return [...rows.values()].sort((a, b) => b.points - a.points || Number(b.winner) - Number(a.winner) || b.wickets - a.wickets || b.runs - a.runs)
}

export type PlayerMatchFigures = {
  batting: { runs: number; balls: number; out: boolean } | null
  bowling: { wickets: number; runs: number; balls: number } | null
}

// A player's batting and bowling line for the match, e.g. "34 (18) & 2/12".
export const matchFigures = (playerId: string, match: PotmMatch, inn1: InningsState, inn2: InningsState): PlayerMatchFigures => {
  const figures: PlayerMatchFigures = { batting: null, bowling: null }
  const innings = [
    { state: inn1, batting: match.battingFirst.playerIds, bowling: match.bowlingFirst.playerIds },
    { state: inn2, batting: match.bowlingFirst.playerIds, bowling: match.battingFirst.playerIds },
  ]
  for (const { state, batting, bowling } of innings) {
    const batter = state.batters.find(item => batting[item.index] === playerId)
    if (batter) figures.batting = { runs: batter.runs, balls: batter.balls, out: batter.out }
    const bowler = state.bowlers.find(item => bowling[item.index] === playerId)
    if (bowler) figures.bowling = { wickets: bowler.wickets, runs: bowler.runs, balls: bowler.balls }
  }
  return figures
}

export const formatMatchFigures =({ batting, bowling }: PlayerMatchFigures) => {
  const parts = []
  if (batting) parts.push(`${batting.runs} (${batting.balls})`)
  if (bowling) parts.push(`${bowling.wickets}/${bowling.runs}`)
  return parts.join(' & ') || 'Did not play'
}

const signed = (value: number) => `${value > 0 ? '+' : ''}${value}`

// Non-zero parts of a breakdown as short labels, e.g. ['Batting 89', 'Strike rate +5', 'Winning team +9.4'].
export const describeBreakdown = (breakdown: PotmBreakdown) => {
  const { batting, strikeRate, bowling, economy, fielding, winningTeam } = breakdown
  const parts: string[] = []
  if (batting) parts.push(`Batting ${batting}`)
  if (strikeRate) parts.push(`Strike rate ${signed(strikeRate)}`)
  if (bowling) parts.push(`Bowling ${bowling}`)
  if (economy) parts.push(`Economy ${signed(economy)}`)
  if (fielding) parts.push(`Fielding ${fielding}`)
  if (winningTeam) parts.push(`Winning team ${signed(winningTeam)}`)
  return parts
}
