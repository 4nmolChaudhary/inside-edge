'use client'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

import { TeamBadge } from '@/components/matches/team-badge'
import { MatchBoard } from '@/components/scorer/match-board'
import { MatchDetails } from '@/components/scorer/match-details'
import { buildMatchView } from '@/components/scorer/match-view'
import { PotmCard } from '@/components/scorer/potm-card'
import { panelClass } from '@/components/scorer/styles'
import type { ScorerMatch } from '@/lib/scoring'
import { formatOvers } from '@/lib/cricket'
import { cn } from '@/lib/utils'

const POLL_INTERVAL_MS = 5000

// Read-only version of the scorer: same engine and components, no run pad.
// The project has no realtime channel, so the server component is re-fetched every 5s while the match is live.
export const LiveView = ({ match, completed = false }: { match: ScorerMatch; completed?: boolean }) => {
  const router = useRouter()
  const { snapshot } = match
  const live = snapshot.status === 'live'

  useEffect(() => {
    if (!live) return
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, POLL_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [live, router])

  const view = useMemo(() => buildMatchView(match, snapshot), [match, snapshot])
  const { state } = view

  const { battingFirst, bowlingFirst, inn1, inn2 } = view
  const secondStarted = view.innings >= 2
  const scores = [
    { team: battingFirst, totals: inn1.totals, started: true },
    { team: bowlingFirst, totals: inn2.totals, started: secondStarted },
  ]
  // super over scores, in batting order (the side that batted second bats first)
  const superScores = [
    { team: bowlingFirst, totals: view.super1.totals, started: view.innings >= 3 },
    { team: battingFirst, totals: view.super2.totals, started: view.innings === 4 },
  ]

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0'>
      <div className={cn(panelClass, 'flex flex-col gap-3')}>
        {scores.map(({ team, totals, started }) => (
          <div key={team.id} className='flex items-center justify-between gap-3'>
            <TeamBadge name={team.name} shortName={team.shortName} logoUrl={team.logoUrl} nameClassName='text-white' />
            {started ? (
              <span className='text-3xl leading-none text-cyan'>
                {totals.runs}/{totals.wickets} <span className='text-lg text-white/60'>({formatOvers(totals.balls)})</span>
              </span>
            ) : (
              <span className='text-lg uppercase text-white/50'>Yet to bat</span>
            )}
          </div>
        ))}
        {view.isSuper && (
          <>
            <div className='border-t border-white/10 pt-3 text-center text-sm uppercase text-yellow'>Super over</div>
            {superScores.map(({ team, totals, started }) => (
              <div key={team.id} className='flex items-center justify-between gap-3'>
                <TeamBadge name={team.name} shortName={team.shortName} logoUrl={team.logoUrl} nameClassName='text-white' />
                {started ? (
                  <span className='text-3xl leading-none text-cyan'>
                    {totals.runs}/{totals.wickets} <span className='text-lg text-white/60'>({formatOvers(totals.balls)})</span>
                  </span>
                ) : (
                  <span className='text-lg uppercase text-white/50'>Yet to bat</span>
                )}
              </div>
            ))}
          </>
        )}
      </div>
      <MatchBoard view={view} striker={state.striker} nonStriker={state.nonStriker} bowler={state.bowler} completed={completed} />
      {!live && <div className={cn(panelClass, 'text-center text-2xl uppercase text-lime')}>{snapshot.resultText ?? 'Match complete'}</div>}
      {snapshot.status === 'completed' && <PotmCard view={view} playerOfMatchId={snapshot.playerOfMatchId} />}
      {live && state.needsOpeners && <div className='text-center text-lg uppercase text-white/50'>Waiting for the first ball</div>}
      <MatchDetails view={view} />
    </div>
  )
}
