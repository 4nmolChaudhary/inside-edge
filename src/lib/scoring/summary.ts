import { countsAsWicket, decodeBall, decodeRetire, isLegalBall } from './token'
import type { Ball, InningsState, PlayerFigures, RetireEvent } from './types'

export type SummaryDelta = { runs: number; wickets: number; balls: number }

// What one delivery adds to the team's runs / wickets / legal-balls summary columns.
// Retirements add no runs or balls; only retired-out (X) is a wicket. Retired-not-out never is.
export const computeSummaryDelta = (token: string): SummaryDelta | null => {
  const retire = decodeRetire(token)
  if (retire) return { runs: 0, wickets: retire.out ? 1 : 0, balls: 0 }
  const ball = decodeBall(token)
  if (!ball) return null
  return { runs: ball.runs + (ball.extra?.runs ?? 0), wickets: ball.wicket && countsAsWicket(ball.wicket.type) ? 1 : 0, balls: isLegalBall(ball) ? 1 : 0 }
}

type ResultTeam = { id: string; name: string; runs: number; wickets: number; squadSize: number }
export type MatchResultInput = { battingFirstId: string; teamA: ResultTeam; teamB: ResultTeam }

export const computeResult = ({ battingFirstId, teamA, teamB }: MatchResultInput): { winnerId: string | null; resultText: string } => {
  const first = battingFirstId === teamA.id ? teamA : teamB
  const second = first.id === teamA.id ? teamB : teamA

  if (second.runs > first.runs) {
    const wicketsLeft = Math.max(second.squadSize - second.wickets, 1)
    return { winnerId: second.id, resultText: `${second.name} won by ${wicketsLeft} wicket${wicketsLeft === 1 ? '' : 's'}` }
  }
  if (first.runs > second.runs) {
    const margin = first.runs - second.runs
    return { winnerId: first.id, resultText: `${first.name} won by ${margin} run${margin === 1 ? '' : 's'}` }
  }
  return { winnerId: null, resultText: 'Match tied' }
}

type SuperOverTeam = { id: string; name: string; runs: number; wickets: number }
// `first` batted first in the super over, `second` chased it.
export type SuperOverResultInput = { first: SuperOverTeam; second: SuperOverTeam }

// One over each: the higher score wins, level scores leave the match tied.
export const computeSuperOverResult = ({ first, second }: SuperOverResultInput): { winnerId: string | null; resultText: string } => {
  const score = `${first.runs}/${first.wickets} v ${second.runs}/${second.wickets}`
  if (second.runs > first.runs) return { winnerId: second.id, resultText: `Match tied. ${second.name} won the super over (${score})` }
  if (first.runs > second.runs) return { winnerId: first.id, resultText: `Match tied. ${first.name} won the super over (${score})` }
  return { winnerId: null, resultText: `Match tied. Super over tied (${score})` }
}

// Rules that depend on what has already happened in the innings.
export const validateBallAgainstState = (ball: Ball, state: InningsState) => {
  if (state.complete.done) return 'Innings is already complete'
  const out = new Set(state.batters.filter(batter => batter.out).map(batter => batter.index))
  if (out.has(ball.striker) || out.has(ball.nonStriker)) return 'A dismissed batter cannot bat'
  if (ball.striker === ball.nonStriker && !state.soloAllowed) return 'Striker and non-striker must be different'
  if (state.lastManStanding && ball.striker !== ball.nonStriker) return 'Last man standing bats alone'
  return null
}

// A retirement happens between balls and only involves a batter currently at the crease.
export const validateRetireAgainstState = (retire: RetireEvent, state: InningsState, battingSize: number) => {
  if (retire.batter >= battingSize) return 'Batter is not in the squad'
  if (state.complete.done) return 'Innings is already complete'
  if (state.needsNewBatter) return 'Pick the next batter first'
  if (state.striker === null || state.nonStriker === null) return 'No batters at the crease'
  if (state.striker === state.nonStriker) return 'The only batter cannot retire'
  if (retire.batter !== state.striker && retire.batter !== state.nonStriker) return 'Only a batter at the crease can retire'
  return null
}

const emptyFigures = (): PlayerFigures => ({ innings: 0, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, outs: 0, highScore: 0, highScoreNotOut: false, fifties: 0, hundreds: 0, ducks: 0, ballsBowled: 0, runsConceded: 0, wickets: 0, maidens: 0, dots: 0, widesNoBalls: 0, bestWickets: 0, bestRuns: 0, threeWicketHauls: 0 })

// One innings gives batting figures for the batting squad and bowling figures for the bowling squad.
// Call it for both innings and merge by player id (each player only bats in one innings and bowls in the other).
export const computeInningsFigures = (state: InningsState, battingIds: readonly string[], bowlingIds: readonly string[]) => {
  const figures = new Map<string, PlayerFigures>()
  const get = (id: string) => {
    let entry = figures.get(id)
    if (!entry) {
      entry = emptyFigures()
      figures.set(id, entry)
    }
    return entry
  }

  for (const batter of state.batters) {
    const id = battingIds[batter.index]
    if (!id) continue
    const f = get(id)
    const dismissed = batter.out // retired-not-out (never returned) is a not out
    f.innings = 1
    f.runs = batter.runs
    f.ballsFaced = batter.balls
    f.fours = batter.fours
    f.sixes = batter.sixes
    f.outs = dismissed ? 1 : 0
    f.highScore = batter.runs
    f.highScoreNotOut = !batter.out
    f.fifties = batter.runs >= 50 && batter.runs < 100 ? 1 : 0
    f.hundreds = batter.runs >= 100 ? 1 : 0
    f.ducks = dismissed && batter.outType !== 'o' && batter.runs === 0 ? 1 : 0
  }

  for (const bowler of state.bowlers) {
    const id = bowlingIds[bowler.index]
    if (!id) continue
    const f = get(id)
    f.ballsBowled = bowler.balls
    f.runsConceded = bowler.runs
    f.wickets = bowler.wickets
    f.maidens = bowler.maidens
    f.dots = bowler.dots
    f.widesNoBalls = bowler.wides + bowler.noBalls
    f.bestWickets = bowler.wickets
    f.bestRuns = bowler.wickets > 0 ? bowler.runs : 0
    f.threeWicketHauls = bowler.wickets >= 3 ? 1 : 0
  }

  return figures
}

export const mergeFigures = (target: Map<string, PlayerFigures>, source: Map<string, PlayerFigures>) => {
  for (const [id, figures] of source) {
    const existing = target.get(id)
    if (!existing) {
      target.set(id, { ...figures })
      continue
    }
    // a player bats in one innings and bowls in the other, so each side's fields are only set once
    existing.innings += figures.innings
    existing.runs += figures.runs
    existing.ballsFaced += figures.ballsFaced
    existing.fours += figures.fours
    existing.sixes += figures.sixes
    existing.outs += figures.outs
    existing.fifties += figures.fifties
    existing.hundreds += figures.hundreds
    existing.ducks += figures.ducks
    if (figures.highScore > existing.highScore) {
      existing.highScore = figures.highScore
      existing.highScoreNotOut = figures.highScoreNotOut
    }
    existing.ballsBowled += figures.ballsBowled
    existing.runsConceded += figures.runsConceded
    existing.wickets += figures.wickets
    existing.maidens += figures.maidens
    existing.dots += figures.dots
    existing.widesNoBalls += figures.widesNoBalls
    existing.threeWicketHauls += figures.threeWicketHauls
    if (figures.bestWickets > existing.bestWickets || (figures.bestWickets === existing.bestWickets && figures.bestWickets > 0 && figures.bestRuns < existing.bestRuns)) {
      existing.bestWickets = figures.bestWickets
      existing.bestRuns = figures.bestRuns
    }
  }
  return target
}
