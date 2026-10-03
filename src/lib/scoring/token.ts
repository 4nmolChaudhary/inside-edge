import type { Ball, ExtraType, RetireEvent, WicketType } from './types'

// <S><N><B><R>[<E><e>][W<t><o>[<F>]]  (S/N/B/F are single base36 chars, so squads are capped at 36 players)
const TOKEN = /^([0-9a-z])([0-9a-z])([0-9a-z])([0-7])(?:([wnbl])([0-9]))?(?:W([bcrshto])([sn])([0-9a-z])?)?$/

// Non-delivery event: R<i> batter i retires not out (can return later), X<i> retires out (a wicket).
const RETIRE_TOKEN = /^([RX])([0-9a-z])$/

export const MAX_SQUAD_SIZE = 36

const toBase36 = (value: number) => value.toString(36)
const fromBase36 = (value: string) => parseInt(value, 36)
const validIndex = (value: number) => Number.isInteger(value) && value >= 0 && value < MAX_SQUAD_SIZE

export const encodeBall = (ball: Ball) => {
  const { striker, nonStriker, bowler, runs, extra, wicket } = ball
  if (!validIndex(striker) || !validIndex(nonStriker) || !validIndex(bowler)) throw new Error('Player index out of range')
  if (!Number.isInteger(runs) || runs < 0 || runs > 7) throw new Error('Runs must be between 0 and 7')

  let token = `${toBase36(striker)}${toBase36(nonStriker)}${toBase36(bowler)}${runs}`
  if (extra) {
    if (!Number.isInteger(extra.runs) || extra.runs < 0 || extra.runs > 9) throw new Error('Extra runs must be between 0 and 9')
    token += `${extra.type}${extra.runs}`
  }
  if (wicket) {
    token += `W${wicket.type}${wicket.out}`
    if (wicket.fielder !== undefined) {
      if (!validIndex(wicket.fielder)) throw new Error('Fielder index out of range')
      token += toBase36(wicket.fielder)
    }
  }
  return token
}

export const decodeBall = (token: string): Ball | null => {
  const match = TOKEN.exec(token)
  if (!match) return null
  const [, striker, nonStriker, bowler, runs, extraType, extraRuns, wicketType, wicketOut, fielder] = match

  const ball: Ball = { striker: fromBase36(striker), nonStriker: fromBase36(nonStriker), bowler: fromBase36(bowler), runs: Number(runs) }
  if (extraType) ball.extra = { type: extraType as ExtraType, runs: Number(extraRuns) }
  if (wicketType) {
    ball.wicket = { type: wicketType as NonNullable<Ball['wicket']>['type'], out: wicketOut as 's' | 'n' }
    if (fielder) ball.wicket.fielder = fromBase36(fielder)
  }
  return ball
}

export const encodeRetire = ({ batter, out }: RetireEvent) => {
  if (!validIndex(batter)) throw new Error('Player index out of range')
  return `${out ? 'X' : 'R'}${toBase36(batter)}`
}

export const decodeRetire = (token: string): RetireEvent | null => {
  const match = RETIRE_TOKEN.exec(token)
  return match ? { batter: fromBase36(match[2]), out: match[1] === 'X' } : null
}

// Retired-not-out ('t') is the only wicket marker that is not a wicket.
export const countsAsWicket = (type: WicketType) => type !== 't'

// Run outs and retirements are the only ways out that need no bat on the ball.
const needsNoBat = (type: WicketType) => type === 'r' || type === 't' || type === 'o'

// Wides and no-balls are re-bowled; everything else is a legal delivery.
export const isLegalBall = (ball: Ball) => ball.extra?.type !== 'w' && ball.extra?.type !== 'n'

// Rule checks beyond the token shape. Returns an error message, or null when the ball is acceptable.
export const validateBall = (ball: Ball, battingSize: number, bowlingSize: number) => {
  const { striker, nonStriker, bowler, runs, extra, wicket } = ball
  if (striker >= battingSize || nonStriker >= battingSize) return 'Batter is not in the squad'
  if (bowler >= bowlingSize) return 'Bowler is not in the squad'
  if (striker !== nonStriker && battingSize < 2) return 'Invalid batters'
  if (wicket?.fielder !== undefined && wicket.fielder >= bowlingSize) return 'Fielder is not in the squad'

  if (extra) {
    if ((extra.type === 'w' || extra.type === 'n') && extra.runs < 1) return 'Wide and no-ball carry at least 1 run'
    if ((extra.type === 'b' || extra.type === 'l') && extra.runs < 1) return 'Byes and leg-byes need at least 1 run'
    if (extra.type === 'w' && runs !== 0) return 'No runs off the bat on a wide'
    if ((extra.type === 'b' || extra.type === 'l') && runs !== 0) return 'No runs off the bat on byes'
  }

  if (wicket) {
    if (wicket.out === 'n' && !needsNoBat(wicket.type)) return 'Only a run out or retirement can dismiss the non-striker'
    if (striker === nonStriker && wicket.out === 'n') return 'No non-striker when batting alone'
    if (extra?.type === 'n' && !needsNoBat(wicket.type)) return 'Only a run out is possible off a no-ball'
    if ((extra?.type === 'b' || extra?.type === 'l') && !needsNoBat(wicket.type)) return 'Only a run out is possible off byes'
  }
  return null
}
