import { captionClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { InningsState, SquadPlayer } from '@/lib/scoring'

type InningsScorecardProps = {
  title: string
  state: InningsState
  battingSquad: SquadPlayer[]
  bowlingSquad: SquadPlayer[]
}

const battingGrid = 'grid grid-cols-[1fr_2.5rem_2.5rem_2rem_2rem_3rem] items-baseline gap-1'
const bowlingGrid = 'grid grid-cols-[1fr_3rem_2rem_2.5rem_2rem_3rem] items-baseline gap-1'

const Head = ({ labels, grid }: { labels: string[]; grid: string }) => (
  <div className={grid}>
    {labels.map((label, index) => (
      <span key={label} className={cn(captionClass, index > 0 && 'text-right')}>
        {label}
      </span>
    ))}
  </div>
)

export const InningsScorecard = ({ title, state, battingSquad, bowlingSquad }: InningsScorecardProps) => {
  const { totals, batters, bowlers, availableBatters } = state
  const { extras } = totals

  return (
    <div className='flex flex-col gap-3 text-white'>
      <div className='flex items-baseline justify-between border-amber-50/5 py-1 border border-x-0'>
        <span className='text-2xl uppercase'>{title}</span>
        <span className='text-2xl text-cyan'>
          {totals.runs}/{totals.wickets}{' '}
          <span className='text-base text-white/50'>
            ({Math.floor(totals.balls / 6)}.{totals.balls % 6})
          </span>
        </span>
      </div>

      <Head grid={battingGrid} labels={['Batter', 'R', 'B', '4s', '6s', 'SR']} />
      {batters.map(batter => (
        <div key={batter.index} className='flex flex-col'>
          <div className={battingGrid}>
            <span className='truncate text-lg uppercase'>{batter.name}</span>
            <span className='text-right text-lg'>{batter.runs}</span>
            <span className='text-right text-white/60'>{batter.balls}</span>
            <span className='text-right text-white/60'>{batter.fours}</span>
            <span className='text-right text-white/60'>{batter.sixes}</span>
            <span className='text-right text-sm text-white/50'>{batter.balls ? batter.strikeRate.toFixed(0) : '-'}</span>
          </div>
          <span className={cn('text-xs -mt-1.5 uppercase font-(family-name:--font-inter-tight)', batter.status === 'batting' ? 'text-lime' : 'text-white/50')}>{batter.status === 'batting' ? 'not out' : batter.dismissal}</span>
        </div>
      ))}
      {!!availableBatters.length && <div className='text-sm uppercase text-white/50 font-(family-name:--font-inter-tight)'>Yet to bat: {availableBatters.map(index => battingSquad[index]?.name ?? '?').join(', ')}</div>}
      <div className='flex justify-between border-t border-white/10 pt-2 text-sm uppercase text-white/70 font-(family-name:--font-inter-tight)'>
        <span>
          Extras ({extras.wides ? `w ${extras.wides}, ` : ''}
          {extras.noBalls ? `nb ${extras.noBalls}, ` : ''}
          {extras.byes ? `b ${extras.byes}, ` : ''}
          {extras.legByes ? `lb ${extras.legByes}` : ''}
          {!extras.total && 'none'})
        </span>
        <span>{extras.total}</span>
      </div>

      <Head grid={bowlingGrid} labels={['Bowler', 'O', 'M', 'R', 'W', 'Econ']} />
      {bowlers.map(bowler => (
        <div key={bowler.index} className={bowlingGrid}>
          <span className='truncate text-lg uppercase'>{bowlingSquad[bowler.index]?.name ?? bowler.name}</span>
          <span className='text-right'>{bowler.overs}</span>
          <span className='text-right text-white/60'>{bowler.maidens}</span>
          <span className='text-right'>{bowler.runs}</span>
          <span className='text-right text-lime'>{bowler.wickets}</span>
          <span className='text-right text-sm text-white/50'>{bowler.balls ? bowler.economy.toFixed(1) : '-'}</span>
        </div>
      ))}
      {!bowlers.length && <span className='text-lg uppercase text-white/40'>No balls bowled</span>}
    </div>
  )
}

