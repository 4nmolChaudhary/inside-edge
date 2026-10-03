import { BattersCard } from '@/components/scorer/batters-card'
import { BowlerCard } from '@/components/scorer/bowler-card'
import type { MatchView } from '@/components/scorer/match-view'
import { OverStrip } from '@/components/scorer/over-strip'
import { ScorerHeader } from '@/components/scorer/scorer-header'

type MatchBoardProps = {
  view: MatchView
  // the batters / bowler currently at the crease (the scorer overrides these with pending selections)
  striker: number | null
  nonStriker: number | null
  bowler: number | null
  // a completed match hides the header, batting, bowling and this-over cards
  completed?: boolean
}

// The score summary shared by the scorer and the read-only live view.
export const MatchBoard = ({ view, striker, nonStriker, bowler, completed = false }: MatchBoardProps) => {
  const { state, battingTeam, bowlingTeam } = view

  return (
    <>
      {!completed && (
        <>
          <ScorerHeader view={view} />
          <BattersCard squad={battingTeam.squad} batters={state.batters} striker={striker} nonStriker={nonStriker} lastManStanding={state.lastManStanding} retired={state.retiredBatters} />
          <BowlerCard squad={bowlingTeam.squad} bowlers={state.bowlers} bowler={bowler} />
          <OverStrip overHistory={state.overHistory} />
        </>
      )}
    </>
  )
}

