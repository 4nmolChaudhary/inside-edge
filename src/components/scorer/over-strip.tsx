import { captionClass, panelClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import { ballKind, ballLabel } from '@/lib/scoring'
import type { Ball, BallKind, OverSummary } from '@/lib/scoring'

const kindClass: Record<BallKind, string> = {
  dot: 'bg-white/10 text-white',
  runs: 'bg-violet text-white',
  boundary: 'bg-lime text-black',
  wicket: 'bg-sporty-red text-white',
  extra: 'bg-yellow text-black',
}

export const BallChip = ({ ball }: { ball: Ball }) => <span className={cn('inline-flex h-10 min-w-10 items-center justify-center rounded-full px-2 text-lg leading-none', kindClass[ballKind(ball)])}>{ballLabel(ball)}</span>

export const OverChips = ({ over }: { over: Pick<OverSummary, 'balls'> }) => (
  <div className='flex flex-wrap gap-2'>
    {over.balls.map((ball, index) => (
      <BallChip key={index} ball={ball} />
    ))}
  </div>
)

export const OverStrip = ({ overHistory }: { overHistory: OverSummary[] }) => {
  const last = overHistory.at(-1)
  const current = last && !last.complete ? last : null

  return (
    <div className={`${panelClass} flex flex-col gap-2`}>
      <div className='flex items-center justify-between'>
        <span className={captionClass}>This over</span>
        {current && <span className={captionClass}>{current.runs} runs</span>}
      </div>
      {current ? <OverChips over={current} /> : <span className='text-lg uppercase text-white/40'>{last ? 'Over complete' : 'Waiting for the first ball'}</span>}
    </div>
  )
}
