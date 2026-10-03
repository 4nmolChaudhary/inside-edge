import { OverChips } from '@/components/scorer/over-strip'
import { captionClass } from '@/components/scorer/styles'
import type { InningsState, SquadPlayer } from '@/lib/scoring'

export const OverHistory = ({ title, state, bowlingSquad }: { title: string; state: InningsState; bowlingSquad: SquadPlayer[] }) => (
  <div className='flex flex-col gap-3'>
    <span className='text-2xl uppercase text-white'>{title}</span>
    {!state.overHistory.length && <span className='text-lg uppercase text-white/40'>No overs yet</span>}
    {[...state.overHistory].reverse().map(over => (
      <div key={over.number} className='flex flex-col gap-2'>
        <div className='flex items-baseline justify-between text-white'>
          <span className='text-lg uppercase'>
            Over {over.number} · {bowlingSquad[over.bowler]?.name ?? '?'}
            {over.maiden && <span className='ml-2 text-lime'>Maiden</span>}
          </span>
          <span className={captionClass}>{over.runs} runs</span>
        </div>
        <OverChips over={over} />
      </div>
    ))}
  </div>
)
