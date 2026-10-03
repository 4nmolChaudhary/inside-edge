import { captionClass, panelClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { BowlerStat, SquadPlayer } from '@/lib/scoring'

export const BowlerCard = ({ squad, bowlers, bowler }: { squad: SquadPlayer[]; bowlers: BowlerStat[]; bowler: number | null }) => {
  const stat = bowler === null ? undefined : bowlers.find(item => item.index === bowler)

  return (
    <div className={`${panelClass} flex flex-col gap-2`}>
      <div className='grid grid-cols-[1fr_3rem_2rem_3rem_2rem_3rem] gap-1'>
        <span className={captionClass}>Bowling</span>
        {['O', 'M', 'R', 'W', 'Econ'].map(label => (
          <span key={label} className={cn(captionClass, 'text-right')}>
            {label}
          </span>
        ))}
      </div>
      <div className='grid grid-cols-[1fr_3rem_2rem_3rem_2rem_3rem] items-center gap-1 text-white'>
        <span className='truncate text-xl uppercase'>{bowler === null ? 'Select bowler' : (squad[bowler]?.name ?? '?')}</span>
        <span className='text-right text-xl'>{stat?.overs ?? '0.0'}</span>
        <span className='text-right text-lg text-white/70'>{stat?.maidens ?? 0}</span>
        <span className='text-right text-xl'>{stat?.runs ?? 0}</span>
        <span className='text-right text-xl text-lime'>{stat?.wickets ?? 0}</span>
        <span className='text-right text-sm text-white/50'>{stat?.balls ? stat.economy.toFixed(1) : '-'}</span>
      </div>
    </div>
  )
}
