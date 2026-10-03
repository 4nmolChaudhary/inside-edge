export type SquadPlayer = { id: string; name: string; number: number | null }

export type ScorerTeam = {
  id: string
  name: string
  shortName: string | null
  logoUrl: string | null
  // index-aligned with the squad array on the match row (ball tokens reference these indices)
  squad: SquadPlayer[]
}

// The mutable part of a match: everything the scorer and live view re-render from.
export type MatchSnapshot = {
  status: 'setup' | 'live' | 'completed' | 'abandoned'
  currentInnings: number // 1-2 regular, 3-4 super over
  inn1Balls: string[]
  inn2Balls: string[]
  super1Balls: string[] // super over: the team that batted 2nd bats first
  super2Balls: string[]
  resultText: string | null
  playerOfMatchId: string | null
}

export type ScorerMatch = {
  id: string
  overs: number
  battingFirst: ScorerTeam // bats in innings 1
  bowlingFirst: ScorerTeam // bats in innings 2
  snapshot: MatchSnapshot
}

export type InningsNumber = 1 | 2 | 3 | 4

// A super over is a single over per side.
export const SUPER_OVER_OVERS = 1

export const isSuperInnings = (innings: number) => innings >= 3

export type ScoringActionResult = { snapshot: MatchSnapshot; error?: undefined } | { error: string; snapshot?: MatchSnapshot }
