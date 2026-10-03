'use client'
import { useState } from 'react'

import { FormDialog } from '@/components/more/form-dialog'
import { choiceClass, choiceSelectedClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'

export type RetireChoice = { end: 'striker' | 'nonStriker'; out: boolean }

type RetireDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  strikerName: string
  nonStrikerName: string
  onConfirm: (choice: RetireChoice) => void
}

const Toggle = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type='button' onClick={onClick} className={cn(choiceClass, 'text-center', active && choiceSelectedClass)}>
    {children}
  </button>
)

// Retiring happens between balls: pick who, pick whether they can come back, then the next-batter picker opens.
export const RetireDialog = ({ open, onOpenChange, strikerName, nonStrikerName, onConfirm }: RetireDialogProps) => {
  const [end, setEnd] = useState<RetireChoice['end'] | null>(null)
  const [out, setOut] = useState<boolean | null>(null)

  const reset = () => {
    setEnd(null)
    setOut(null)
  }
  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }
  const ready = end !== null && out !== null

  return (
    <FormDialog open={open} onOpenChange={handleOpenChange} title='Retire batter' description='Who is retiring?'>
      <div className='grid grid-cols-2 gap-3'>
        <Toggle active={end === 'striker'} onClick={() => setEnd('striker')}>
          {strikerName}
        </Toggle>
        <Toggle active={end === 'nonStriker'} onClick={() => setEnd('nonStriker')}>
          {nonStrikerName}
        </Toggle>
      </div>
      <div className='text-center text-lg uppercase'>How?</div>
      <div className='grid grid-cols-2 gap-3'>
        <Toggle active={out === false} onClick={() => setOut(false)}>
          Retired (can return)
        </Toggle>
        <Toggle active={out === true} onClick={() => setOut(true)}>
          Retired out
        </Toggle>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        <button type='button' onClick={() => handleOpenChange(false)} className={cn(choiceClass, 'bg-white text-black text-center')}>
          Cancel
        </button>
        <button
          type='button'
          disabled={!ready}
          onClick={() => {
            if (!ready) return
            const choice = { end, out }
            reset()
            onConfirm(choice)
          }}
          className={cn(choiceClass, 'text-center')}
        >
          Confirm
        </button>
      </div>
    </FormDialog>
  )
}
