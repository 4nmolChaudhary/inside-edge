import { countsAsWicket, decodeBall, decodeRetire, isLegalBall } from './token'
import type { Ball, BatterStat, BatterStatus, BowlerStat, FallOfWicket, InningsComplete, InningsState, OverSummary, WicketType } from './types'

const BALLS_PER_OVER = 6

const formatOvers = (balls: number) => `${Math.floor(balls / BALLS_PER_OVER)}.${balls % BALLS_PER_OVER}`

type BatterAcc = { index: number; order: number; status: BatterStatus; runs: number; balls: number; fours: number; sixes: number; out: boolean; outType: WicketType | null; dismissal: string | null }
type BowlerAcc = { index: number; order: number; balls: number; maidens: number; runs: number; wickets: number; wides: number; noBalls: number; dots: number }
type OverAcc = { number: number; bowler: number; tokens: string[]; balls: Ball[]; runs: number; conceded: number; legal: number; bowlers: Set<number> }

const dismissalText = (ball: Ball, battingSquad: readonly string[], bowlingSquad: readonly string[]) => {
  const wicket = ball.wicket
  if (!wicket) return null
  const bowler = bowlingSquad[ball.bowler] ?? '?'
  const fielder = wicket.fielder !== undefined ? (bowlingSquad[wicket.fielder] ?? '?') : null
  switch (wicket.type) {
    case 'b':
      return `b ${bowler}`
    case 'c':
      return !fielder ? `c b ${bowler}` : wicket.fielder === ball.bowler ? `c & b ${bowler}` : `c ${fielder} b ${bowler}`
    case 's':
      return fielder ? `st ${fielder} b ${bowler}` : `st b ${bowler}`
    case 'r':
      return fielder ? `run out (${fielder})` : 'run out'
    case 'h':
      return `hit wicket b ${bowler}`
    case 't':
      return 'retired not out'
    case 'o':
      return 'retired out'
  }
}

// Pure replay of one innings from its ball tokens. Squads are display names (or ids), indexed like the tokens.
export const replayInnings = (tokens: readonly string[], battingSquad: readonly string[], bowlingSquad: readonly string[], oversLimit: number, target?: number | null): InningsState => {
  const squadSize = battingSquad.length
  const batters = new Map<number, BatterAcc>()
  const bowlers = new Map<number, BowlerAcc>()
  const fallOfWickets: FallOfWicket[] = []
  const overHistory: OverSummary[] = []

  let runs = 0
  let wickets = 0
  let legalBalls = 0
  let wides = 0
  let noBalls = 0
  let byes = 0
  let legByes = 0
  let partnershipRuns = 0
  let partnershipBalls = 0
  let striker: number | null = null
  let nonStriker: number | null = null
  let bowler: number | null = null
  let vacancy = false // the last event emptied a crease end (wicket or retirement)
  let lastWasRunOut = false
  let lastBallLegal = false
  let previousOverBowler: number | null = null
  let over: OverAcc | null = null

  const ensureBatter = (index: number) => {
    let acc = batters.get(index)
    if (!acc) {
      acc = { index, order: batters.size, status: 'batting', runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outType: null, dismissal: null }
      batters.set(index, acc)
    }
    return acc
  }
  // a batter appearing on a ball is at the crease; a retired batter returning keeps the same entry and score
  const touchBatter = (index: number) => {
    const acc = ensureBatter(index)
    if (acc.status === 'retired') {
      acc.status = 'batting'
      acc.dismissal = null
    }
    return acc
  }
  const ensureBowler = (index: number) => {
    let acc = bowlers.get(index)
    if (!acc) {
      acc = { index, order: bowlers.size, balls: 0, maidens: 0, runs: 0, wickets: 0, wides: 0, noBalls: 0, dots: 0 }
      bowlers.set(index, acc)
    }
    return acc
  }

  const dismiss = (acc: BatterAcc, type: WicketType, dismissal: string | null) => {
    wickets += 1
    acc.status = 'out'
    acc.out = true
    acc.outType = type
    acc.dismissal = dismissal
    fallOfWickets.push({ wicket: wickets, runs, batter: acc.index, over: formatOvers(legalBalls) })
  }
  const retireNotOut = (acc: BatterAcc) => {
    acc.status = 'retired'
    acc.dismissal = 'retired not out'
  }

  for (const token of tokens) {
    // between-ball retirement: no runs, no ball, no over bookkeeping
    const retire = decodeRetire(token)
    if (retire) {
      const acc = ensureBatter(retire.batter)
      if (retire.out) dismiss(acc, 'o', 'retired out')
      else retireNotOut(acc)
      partnershipRuns = 0
      partnershipBalls = 0
      if (striker === retire.batter) striker = null
      if (nonStriker === retire.batter) nonStriker = null
      vacancy = true
      lastWasRunOut = false
      continue
    }

    const ball = decodeBall(token)
    if (!ball) continue

    const legal = isLegalBall(ball)
    const extraType = ball.extra?.type
    const extraRuns = ball.extra?.runs ?? 0
    const total = ball.runs + extraRuns

    const strikerAcc = touchBatter(ball.striker)
    if (ball.nonStriker !== ball.striker) touchBatter(ball.nonStriker)
    const bowlerAcc = ensureBowler(ball.bowler)

    runs += total
    if (extraType === 'w') wides += extraRuns
    if (extraType === 'n') noBalls += extraRuns
    if (extraType === 'b') byes += extraRuns
    if (extraType === 'l') legByes += extraRuns

    // batter: wides are not faced; byes / leg-byes and no-balls are
    if (extraType !== 'w') strikerAcc.balls += 1
    strikerAcc.runs += ball.runs
    if (ball.runs === 4) strikerAcc.fours += 1
    if (ball.runs === 6) strikerAcc.sixes += 1

    // bowler: byes and leg-byes are not charged
    const conceded = extraType === 'b' || extraType === 'l' ? 0 : total
    bowlerAcc.runs += conceded
    if (extraType === 'w') bowlerAcc.wides += 1
    if (extraType === 'n') bowlerAcc.noBalls += 1
    if (legal) {
      legalBalls += 1
      bowlerAcc.balls += 1
      if (conceded === 0) bowlerAcc.dots += 1
    }

    partnershipRuns += total
    if (legal) partnershipBalls += 1

    let outIndex: number | null = null
    if (ball.wicket) {
      outIndex = ball.wicket.out === 's' ? ball.striker : ball.nonStriker
      const outAcc = ensureBatter(outIndex)
      if (countsAsWicket(ball.wicket.type)) {
        dismiss(outAcc, ball.wicket.type, dismissalText(ball, battingSquad, bowlingSquad))
        if (['b', 'c', 's', 'h'].includes(ball.wicket.type)) bowlerAcc.wickets += 1
      } else {
        retireNotOut(outAcc)
      }
      partnershipRuns = 0
      partnershipBalls = 0
    }

    // over bookkeeping
    if (!over) over = { number: overHistory.length + 1, bowler: ball.bowler, tokens: [], balls: [], runs: 0, conceded: 0, legal: 0, bowlers: new Set() }
    over.tokens.push(token)
    over.balls.push(ball)
    over.runs += total
    over.conceded += conceded
    over.bowlers.add(ball.bowler)
    if (legal) over.legal += 1
    const overDone = over.legal === BALLS_PER_OVER
    if (overDone) {
      const maiden = over.bowlers.size === 1 && over.conceded === 0
      if (maiden) bowlerAcc.maidens += 1
      overHistory.push({ number: over.number, bowler: over.bowler, tokens: over.tokens, balls: over.balls, runs: over.runs, legalBalls: over.legal, complete: true, maiden })
      previousOverBowler = ball.bowler
      over = null
    }

    // where the batters stand for the next ball: odd runs swap, end of over swaps again, never when batting alone
    const ran = extraType === 'w' ? extraRuns - 1 : extraType === 'b' || extraType === 'l' ? extraRuns : ball.runs
    let swap = ran % 2 === 1
    if (legal && legalBalls % BALLS_PER_OVER === 0) swap = !swap
    if (ball.striker === ball.nonStriker) swap = false
    let s: number | null = swap ? ball.nonStriker : ball.striker
    let n: number | null = swap ? ball.striker : ball.nonStriker
    if (outIndex !== null) {
      if (s === outIndex) s = null
      if (n === outIndex) n = null
    }
    striker = s
    nonStriker = n
    bowler = ball.bowler
    vacancy = !!ball.wicket
    lastWasRunOut = ball.wicket?.type === 'r'
    lastBallLegal = legal
  }

  if (over) overHistory.push({ number: over.number, bowler: over.bowler, tokens: over.tokens, balls: over.balls, runs: over.runs, legalBalls: over.legal, complete: false, maiden: false })

  // who can still bat: never-batted players and retired-not-out players (who may return)
  const availableBatters = Array.from({ length: squadSize }, (_, index) => index).filter(index => !batters.has(index))
  const retiredBatters = [...batters.values()]
    .filter(acc => acc.status === 'retired')
    .sort((a, b) => a.order - b.order)
    .map(acc => acc.index)
  const eligible = availableBatters.length + retiredBatters.length
  const crease = [...new Set([striker, nonStriker].filter((index): index is number => index !== null))]

  const allOut = squadSize > 0 && crease.length === 0 && eligible === 0
  const complete: InningsComplete =
    target != null && runs >= target ? { done: true, reason: 'target' } : allOut ? { done: true, reason: 'allOut' } : legalBalls >= oversLimit * BALLS_PER_OVER ? { done: true, reason: 'overs' } : { done: false, reason: null }

  // last man standing: one batter left and nobody eligible to join, so they face every ball and strike never rotates
  const lastManStanding = !allOut && squadSize > 1 && tokens.length > 0 && crease.length === 1 && eligible === 0
  const soloAllowed = lastManStanding || (!complete.done && tokens.length > 0 && crease.length === 1 && availableBatters.length === 0 && retiredBatters.length > 0)

  if (lastManStanding && (striker === null || nonStriker === null)) {
    const remaining = striker ?? nonStriker
    striker = remaining
    nonStriker = remaining
  }

  const needsNewBatter =
    !complete.done && vacancy && eligible > 0 && (striker === null || nonStriker === null)
      ? { vacated: (striker === null ? 'striker' : 'nonStriker') as 'striker' | 'nonStriker', runOut: lastWasRunOut, vacancies: (striker === null && nonStriker === null ? 2 : 1) as 1 | 2 }
      : null

  const batterStats: BatterStat[] = [...batters.values()]
    .sort((a, b) => a.order - b.order)
    .map(acc => ({ ...acc, name: battingSquad[acc.index] ?? '?', strikeRate: acc.balls ? (acc.runs / acc.balls) * 100 : 0 }))
  const bowlerStats: BowlerStat[] = [...bowlers.values()]
    .sort((a, b) => a.order - b.order)
    .map(acc => ({ ...acc, name: bowlingSquad[acc.index] ?? '?', overs: formatOvers(acc.balls), economy: acc.balls ? acc.runs / (acc.balls / BALLS_PER_OVER) : 0 }))

  return {
    totals: { runs, wickets, balls: legalBalls, extras: { wides, noBalls, byes, legByes, total: wides + noBalls + byes + legByes } },
    striker,
    nonStriker,
    bowler,
    needsOpeners: tokens.length === 0,
    needsNewBatter,
    needsNewBowler: !complete.done && lastBallLegal && legalBalls > 0 && legalBalls % BALLS_PER_OVER === 0,
    previousOverBowler,
    lastManStanding,
    soloAllowed,
    availableBatters,
    retiredBatters,
    batters: batterStats,
    bowlers: bowlerStats,
    fallOfWickets,
    partnership: { runs: partnershipRuns, balls: partnershipBalls },
    overHistory,
    complete,
  }
}
