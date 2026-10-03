import { SUPER_OVER_OVERS, isSuperInnings, replayInnings } from '@/lib/scoring'
import type { InningsNumber, MatchSnapshot, PotmMatch, ScorerMatch, SquadPlayer } from '@/lib/scoring'

const names = (squad: SquadPlayer[]) => squad.map(player => player.name)

// Everything the scorer and the live view render is derived from the ball logs here, on every render.
export const buildMatchView = (match: ScorerMatch, snapshot: MatchSnapshot) => {
  const { battingFirst, bowlingFirst, overs } = match
  const inn1 = replayInnings(snapshot.inn1Balls, names(battingFirst.squad), names(bowlingFirst.squad), overs)
  const inn2 = replayInnings(snapshot.inn2Balls, names(bowlingFirst.squad), names(battingFirst.squad), overs, inn1.totals.runs + 1)
  // super over (tie breaker): the side that batted second bats first
  const super1 = replayInnings(snapshot.super1Balls, names(bowlingFirst.squad), names(battingFirst.squad), SUPER_OVER_OVERS)
  const super2 = replayInnings(snapshot.super2Balls, names(battingFirst.squad), names(bowlingFirst.squad), SUPER_OVER_OVERS, super1.totals.runs + 1)

  const innings: InningsNumber = snapshot.currentInnings === 4 ? 4 : snapshot.currentInnings === 3 ? 3 : snapshot.currentInnings === 2 ? 2 : 1
  const current = {
    1: { state: inn1, tokens: snapshot.inn1Balls, battingTeam: battingFirst, bowlingTeam: bowlingFirst, target: null },
    2: { state: inn2, tokens: snapshot.inn2Balls, battingTeam: bowlingFirst, bowlingTeam: battingFirst, target: inn1.totals.runs + 1 },
    3: { state: super1, tokens: snapshot.super1Balls, battingTeam: bowlingFirst, bowlingTeam: battingFirst, target: null },
    4: { state: super2, tokens: snapshot.super2Balls, battingTeam: battingFirst, bowlingTeam: bowlingFirst, target: super1.totals.runs + 1 },
  }[innings]

  return {
    overs,
    inningsOvers: isSuperInnings(innings) ? SUPER_OVER_OVERS : overs, // overs available in the innings being scored
    innings,
    isSuper: isSuperInnings(innings),
    battingFirst,
    bowlingFirst,
    inn1,
    inn2,
    super1,
    super2,
    ...current,
  }
}

export type MatchView = ReturnType<typeof buildMatchView>

export type MatchPlayer = { id: string; name: string; teamId: string; teamName: string }

// Every player in the match, batting-first squad first.
export const matchPlayers = ({ battingFirst, bowlingFirst }: MatchView): MatchPlayer[] =>
  [battingFirst, bowlingFirst].flatMap(team => team.squad.map(player => ({ id: player.id, name: player.name, teamId: team.id, teamName: team.name })))

// Input for the pure Player of the Match functions (player ids, not squad indices).
export const potmMatchOf = ({ battingFirst, bowlingFirst }: MatchView, winnerId: string | null): PotmMatch => ({
  battingFirst: { teamId: battingFirst.id, playerIds: battingFirst.squad.map(player => player.id) },
  bowlingFirst: { teamId: bowlingFirst.id, playerIds: bowlingFirst.squad.map(player => player.id) },
  winnerId,
})
