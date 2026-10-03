'use client'
import { useState } from 'react'

import { FormDialog } from '@/components/more/form-dialog'
import { choiceClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { ExtraType } from '@/lib/scoring'

const EXTRAS: { type: ExtraType; label: string }[] = [
  { type: 'w', label: 'Wide' },
  { type: 'n', label: 'No ball' },
  { type: 'b', label: 'Bye' },
  { type: 'l', label: 'Leg bye' },
]

const padButton = 'flex h-18 items-center justify-center rounded-xl bg-violet text-5xl text-white transition-transform active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100'

type RunPadProps = {
  disabled: boolean
  extra: ExtraType | null
  onExtraChange: (extra: ExtraType | null) => void
  onRuns: (runs: number) => void
  onWicket: () => void
}

export const RunPad = ({ disabled, extra, onExtraChange, onRuns, onWicket }: RunPadProps) => {
  const [moreOpen, setMoreOpen] = useState(false)
  const byeLike = extra === 'b' || extra === 'l'

  const pick = (runs: number) => {
    setMoreOpen(false)
    onRuns(runs)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='grid grid-cols-4 gap-3'>
        {[0, 1, 2, 3, 4, 6].map(runs => (
          <button key={runs} type='button' disabled={disabled || (byeLike && runs === 0)} onClick={() => pick(runs)} className={cn(padButton, runs >= 4 && 'bg-lime text-black')}>
            {runs}
          </button>
        ))}
        <button type='button' disabled={disabled} onClick={() => setMoreOpen(true)} className={cn(padButton, 'col-span-2 text-4xl')}>
          5 / 7
        </button>
      </div>

      <div className='grid grid-cols-4 gap-3'>
        {EXTRAS.map(item => (
          <button
            key={item.type}
            type='button'
            disabled={disabled}
            aria-pressed={extra === item.type}
            onClick={() => onExtraChange(extra === item.type ? null : item.type)}
            className={cn('h-14 rounded-xl bg-white/10 text-xl uppercase leading-none text-white transition-transform active:scale-[0.96] disabled:opacity-40', extra === item.type && 'bg-yellow text-black')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button type='button' disabled={disabled} onClick={onWicket} className='h-16 rounded-xl bg-sporty-red text-4xl uppercase text-white transition-transform active:scale-[0.98] disabled:opacity-40'>
        Wicket
      </button>

      <FormDialog open={moreOpen} onOpenChange={setMoreOpen} title='More runs'>
        <div className='grid grid-cols-2 gap-3'>
          {[5, 7].map(runs => (
            <button key={runs} type='button' onClick={() => pick(runs)} className={cn(choiceClass, 'py-6 text-center text-5xl')}>
              {runs}
            </button>
          ))}
        </div>
      </FormDialog>
    </div>
  )
}
