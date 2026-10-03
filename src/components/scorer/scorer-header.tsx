import { TeamBadge } from '@/components/matches/team-badge'
import { captionClass, panelClass } from '@/components/scorer/styles'
import type { MatchView } from '@/components/scorer/match-view'
import { formatOvers } from '@/lib/cricket'

const rate = (value: number) => (Number.isFinite(value) ? value.toFixed(2) : '0.00')

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className='flex flex-col'>
    <span className={captionClass}>{label}</span>
    <span className='text-2xl text-white leading-tight'>{value}</span>
  </div>
)

export const ScorerHeader = ({ view }: { view: MatchView }) => {
  const { battingTeam, state, innings, inningsOvers: overs, target } = view
  const { runs, wickets, balls } = state.totals

  const crr = balls ? runs / (balls / 6) : 0
  const ballsLeft = Math.max(overs * 6 - balls, 0)
  const needed = target === null ? 0 : Math.max(target - runs, 0)
  const rrr = ballsLeft ? (needed / ballsLeft) * 6 : 0

  return (
    <div className={`${panelClass} flex flex-col gap-3`}>
      <div className='flex items-center justify-between gap-3'>
        <TeamBadge name={battingTeam.name} shortName={battingTeam.shortName} logoUrl={battingTeam.logoUrl} nameClassName='text-white' />
        <span className={captionClass}>
          {innings === 1 ? '1st innings' : innings === 2 ? '2nd innings' : 'Super over'} · {overs} {overs === 1 ? 'over' : 'overs'}
        </span>
      </div>
      <div className='flex items-end justify-between gap-3'>
        <div className='flex items-end gap-2'>
          <span className='text-6xl leading-none text-cyan'>
            {runs}/{wickets}
          </span>
          <span className='pb-1 text-xl text-white/60'>({formatOvers(balls)})</span>
        </div>
        <Stat label='CRR' value={rate(crr)} />
      </div>
      {target !== null && (
        <div className='grid grid-cols-4 gap-2 border-t border-white/10 pt-3'>
          <Stat label='Target' value={`🎯${target}`} />
          <Stat label='Need' value={needed} />
          <Stat label='Balls' value={ballsLeft} />
          <Stat label='RRR' value={ballsLeft ? rate(rrr) : '-'} />
        </div>
      )}
    </div>
  )
}

