export type ExtraType = 'w' | 'n' | 'b' | 'l'
// t = retired not out (not a wicket, may return), o = retired out (a wicket, cannot return)
export type WicketType = 'b' | 'c' | 'r' | 's' | 'h' | 't' | 'o'
export type WicketOut = 's' | 'n'

export type Ball = {
  striker: number
  nonStriker: number
  bowler: number
  runs: number // runs off the bat (0-7)
  extra?: { type: ExtraType; runs: number }
  wicket?: { type: WicketType; out: WicketOut; fielder?: number }
}

// A non-delivery event: a batter at the crease retires between balls (R<i> not out, X<i> out).
export type RetireEvent = { batter: number; out: boolean }

export type BatterStatus = 'batting' | 'retired' | 'out'

export type BatterStat = {
  status: BatterStatus
  index: number
  name: string
  order: number
  runs: number
  balls: number
  fours: number
  sixes: number
  strikeRate: number
  out: boolean // dismissed (retired-not-out batters are not out)
  outType: WicketType | null
  dismissal: string | null // 'retired not out' while retired; null while batting
}

export type BowlerStat = {
  index: number
  name: string
  order: number
  balls: number
  overs: string
  maidens: number
  runs: number
  wickets: number
  economy: number
  wides: number
  noBalls: number
  dots: number
}

export type FallOfWicket = { wicket: number; runs: number; batter: number; over: string }

export type OverSummary = {
  number: number
  bowler: number
  tokens: string[]
  balls: Ball[]
  runs: number
  legalBalls: number
  complete: boolean
  maiden: boolean
}

export type InningsTotals = {
  runs: number
  wickets: number
  balls: number
  extras: { wides: number; noBalls: number; byes: number; legByes: number; total: number }
}

export type InningsComplete = { done: boolean; reason: 'overs' | 'allOut' | 'target' | null }

export type InningsState = {
  totals: InningsTotals
  striker: number | null
  nonStriker: number | null
  bowler: number | null
  needsOpeners: boolean
  // set right after a wicket when someone is still available to bat; `vacated` is the empty end
  // `vacancies` is 2 when the crease is empty (the solo batter went out while retired batters can return)
  needsNewBatter: { vacated: 'striker' | 'nonStriker'; runOut: boolean; vacancies: 1 | 2 } | null
  needsNewBowler: boolean
  previousOverBowler: number | null
  lastManStanding: boolean
  // one batter may bat alone: forced (last man standing) or chosen while only retired batters are left to return
  soloAllowed: boolean
  availableBatters: number[] // yet to bat
  retiredBatters: number[] // retired not out, eligible to return
  batters: BatterStat[]
  bowlers: BowlerStat[]
  fallOfWickets: FallOfWicket[]
  partnership: { runs: number; balls: number }
  overHistory: OverSummary[]
  complete: InningsComplete
}

export type PlayerFigures = {
  innings: number
  runs: number
  ballsFaced: number
  fours: number
  sixes: number
  outs: number
  highScore: number
  highScoreNotOut: boolean
  fifties: number
  hundreds: number
  ducks: number
  ballsBowled: number
  runsConceded: number
  wickets: number
  maidens: number
  dots: number
  widesNoBalls: number
  bestWickets: number
  bestRuns: number
  threeWicketHauls: number
}
