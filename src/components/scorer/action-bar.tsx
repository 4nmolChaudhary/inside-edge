'use client'
import { ArrowLeftRight, Flag, LogOut, Repeat, Undo2, XCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

type ActionBarProps = {
  busy: boolean
  canUndo: boolean
  canSwap: boolean
  inningsLabel: string
  onUndo: () => void
  onSwap: () => void
  onEndInnings: () => void
  // hidden unless provided
  canRetire?: boolean
  onRetire?: () => void
  onChangeBowler?: () => void
  onAbandon?: () => void
}

const actionClass = 'flex h-16 flex-col items-center justify-center gap-1 rounded-xl bg-white/10 px-2 text-base uppercase leading-none text-white transition-transform active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100'

export const ActionBar = ({ busy, canUndo, canSwap, inningsLabel, onUndo, onSwap, onEndInnings, canRetire = true, onRetire, onChangeBowler, onAbandon }: ActionBarProps) => (
  <div className='grid grid-cols-3 gap-3'>
    <button type='button' disabled={busy || !canUndo} onClick={onUndo} className={actionClass}>
      <Undo2 size={22} /> Undo ball
    </button>
    <button type='button' disabled={busy || !canSwap} onClick={onSwap} className={actionClass}>
      <ArrowLeftRight size={22} /> Swap strike
    </button>
    <button type='button' disabled={busy} onClick={onEndInnings} className={actionClass}>
      <Flag size={22} /> {inningsLabel}
    </button>
    {onRetire && (
      <button type='button' disabled={busy || !canRetire} onClick={onRetire} className={actionClass}>
        <LogOut size={22} /> Retire batter
      </button>
    )}
    {onChangeBowler && (
      <button type='button' disabled={busy} onClick={onChangeBowler} className={actionClass}>
        <Repeat size={22} /> Change bowler
      </button>
    )}
    {onAbandon && (
      <button type='button' disabled={busy} onClick={onAbandon} className={cn(actionClass, 'bg-sporty-red/20 text-sporty-red')}>
        <XCircle size={22} /> Abandon
      </button>
    )}
  </div>
)
