import { captionClass, panelClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { BatterStat, SquadPlayer } from '@/lib/scoring'

type BattersCardProps = {
  squad: SquadPlayer[]
  batters: BatterStat[]
  striker: number | null
  nonStriker: number | null
  lastManStanding: boolean
  retired?: number[] // retired not out, shown under the current pair
}

const Row = ({ name, stat, onStrike }: { name: string; stat?: BatterStat; onStrike: boolean }) => (
  <div className='grid grid-cols-[1fr_4rem_2rem_2rem_3rem] items-center gap-1 text-white'>
    <span className={cn('truncate text-xl uppercase', onStrike && 'text-lime')}>
      {name}
      {onStrike && '🏏'}
    </span>
    <span className='text-right text-xl'>
      {stat?.runs ?? 0} <span className='text-sm text-white/50'>({stat?.balls ?? 0})</span>
    </span>
    <span className='text-right text-lg text-white/70'>{stat?.fours ?? 0}</span>
    <span className='text-right text-lg text-white/70'>{stat?.sixes ?? 0}</span>
    <span className='text-right text-sm text-white/50'>{stat?.balls ? stat.strikeRate.toFixed(0) : '-'}</span>
  </div>
)

export const BattersCard = ({ squad, batters, striker, nonStriker, lastManStanding, retired = [] }: BattersCardProps) => {
  const statOf = (index: number | null) => (index === null ? undefined : batters.find(batter => batter.index === index))
  const crease = striker !== null && striker === nonStriker ? [striker] : [striker, nonStriker]

  return (
    <div className={`${panelClass} flex flex-col gap-2`}>
      <div className='grid grid-cols-[1fr_4rem_2rem_2rem_3rem] gap-1'>
        <span className={captionClass}>Batting</span>
        <span className={cn(captionClass, 'text-right')}>R (B)</span>
        <span className={cn(captionClass, 'text-right')}>4s</span>
        <span className={cn(captionClass, 'text-right')}>6s</span>
        <span className={cn(captionClass, 'text-right')}>SR</span>
      </div>
      {crease.map((index, slot) =>
        index === null ? (
          <div key={`empty-${slot}`} className='text-lg uppercase text-white/40'>
            Next batter coming in
          </div>
        ) : (
          <Row key={index} name={squad[index]?.name ?? '?'} stat={statOf(index)} onStrike={index === striker} />
        ),
      )}
      {lastManStanding && <span className='w-fit rounded-full bg-yellow px-3 py-0.5 text-sm uppercase'>Last man standing</span>}
      {retired.length > 0 && (
        <div className='flex flex-col gap-1 border-t border-white/10 pt-2'>
          <span className={captionClass}>Retired</span>
          {retired.map(index => {
            const stat = statOf(index)
            return (
              <div key={index} className='flex items-baseline justify-between text-white/70'>
                <span className='truncate text-lg uppercase'>{squad[index]?.name ?? '?'}</span>
                <span className='text-lg'>
                  {stat?.runs ?? 0} <span className='text-sm text-white/50'>({stat?.balls ?? 0})</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

