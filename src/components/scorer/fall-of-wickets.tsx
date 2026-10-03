import type { InningsState, SquadPlayer } from '@/lib/scoring'

export const FallOfWickets = ({ title, state, battingSquad }: { title: string; state: InningsState; battingSquad: SquadPlayer[] }) => (
  <div className='flex flex-col gap-2'>
    <span className='text-2xl uppercase text-white'>{title}</span>
    {!state.fallOfWickets.length && <span className='text-lg uppercase text-white/40'>No wickets yet</span>}
    {state.fallOfWickets.map(fall => (
      <div key={fall.wicket} className='flex items-baseline justify-between text-lg uppercase text-white'>
        <span>
          {fall.wicket}-{fall.runs}
        </span>
        <span className='truncate pl-3 text-white/70'>
          {battingSquad[fall.batter]?.name ?? '?'} <span className='text-white/50'>({fall.over} ov)</span>
        </span>
      </div>
    ))}
  </div>
)
