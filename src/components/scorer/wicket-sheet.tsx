'use client'
import { useState } from 'react'

import { FormDialog } from '@/components/more/form-dialog'
import { PlayerChoice, toOptions } from '@/components/scorer/player-choice'
import { choiceClass, choiceSelectedClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { ExtraType, SquadPlayer, WicketOut, WicketType } from '@/lib/scoring'

export type WicketDraft = { type: WicketType; out: WicketOut; fielder?: number; runs: number }

// No LBW in gully cricket.
const TYPES: { type: WicketType; label: string }[] = [
  { type: 'b', label: 'Bowled' },
  { type: 'c', label: 'Caught' },
  { type: 'r', label: 'Run out' },
  { type: 's', label: 'Stumped' },
  { type: 'h', label: 'Hit wicket' },
]

// Retiring is its own action (between balls), not a way of being out on a delivery.
// A no-ball or a bye/leg-bye can only be a run out; a wide also allows stumped / hit wicket.
const allowed = (type: WicketType, extra: ExtraType | null) => {
  if (type === 'r') return true
  if (extra === 'n' || extra === 'b' || extra === 'l') return false
  if (extra === 'w') return type === 's' || type === 'h'
  return true
}

type WicketSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  extra: ExtraType | null
  lastManStanding: boolean
  strikerName: string
  nonStrikerName: string
  bowlingSquad: SquadPlayer[]
  bowlerIndex: number | null
  onConfirm: (draft: WicketDraft) => void
}

const Toggle = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button type='button' onClick={onClick} className={cn(choiceClass, 'text-center', active && choiceSelectedClass)}>
    {children}
  </button>
)

export const WicketSheet = ({ open, onOpenChange, extra, lastManStanding, strikerName, nonStrikerName, bowlingSquad, bowlerIndex, onConfirm }: WicketSheetProps) => {
  const [type, setType] = useState<WicketType | null>(null)
  const [out, setOut] = useState<WicketOut>('s')
  const [runs, setRuns] = useState(0)
  const [fielder, setFielder] = useState<number | null>(null)

  const reset = () => {
    setType(null)
    setOut('s')
    setRuns(0)
    setFielder(null)
  }
  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }
  const confirm = (draft: WicketDraft) => {
    reset()
    onConfirm(draft)
  }

  const fielderOptions = toOptions(bowlingSquad).map(option => ({ ...option, hint: option.index === bowlerIndex ? 'Bowler' : option.hint }))
  const outChoice = (
    <div className='grid grid-cols-2 gap-3'>
      <Toggle active={out === 's'} onClick={() => setOut('s')}>
        {strikerName}
      </Toggle>
      <Toggle active={out === 'n'} onClick={() => setOut('n')}>
        {nonStrikerName}
      </Toggle>
    </div>
  )

  return (
    <FormDialog open={open} onOpenChange={handleOpenChange} title={type ? TYPES.find(item => item.type === type)!.label : 'Wicket'} description={type ? undefined : 'How was the batter dismissed?'}>
      {!type && (
        <div className='grid grid-cols-2 gap-3'>
          {TYPES.map(item => (
            <button
              key={item.type}
              type='button'
              disabled={!allowed(item.type, extra)}
              onClick={() => {
                if (item.type === 'b' || item.type === 'h') confirm({ type: item.type, out: 's', runs: 0 })
                else setType(item.type)
              }}
              className={cn(choiceClass, 'py-5 text-center')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {(type === 'c' || type === 's') && (
        <>
          <PlayerChoice options={fielderOptions} selected={fielder} onSelect={setFielder} />
          <div className='grid grid-cols-2 gap-3'>
            <button type='button' onClick={() => setType(null)} className={cn(choiceClass, 'bg-white text-black text-center')}>
              Back
            </button>
            <button type='button' onClick={() => confirm({ type, out: 's', runs: 0, ...(fielder !== null && { fielder }) })} className={cn(choiceClass, 'text-center')}>
              {fielder === null ? 'No fielder' : 'Confirm'}
            </button>
          </div>
        </>
      )}

      {type === 'r' && (
        <>
          {!lastManStanding && outChoice}
          <div className='text-center text-lg uppercase'>Runs completed</div>
          <div className='grid grid-cols-4 gap-3'>
            {[0, 1, 2, 3].map(value => (
              <Toggle key={value} active={runs === value} onClick={() => setRuns(value)}>
                {value}
              </Toggle>
            ))}
          </div>
          <div className='text-center text-lg uppercase'>Fielder</div>
          <PlayerChoice options={fielderOptions} selected={fielder} onSelect={index => setFielder(fielder === index ? null : index)} />
          <div className='grid grid-cols-2 gap-3'>
            <button type='button' onClick={() => setType(null)} className={cn(choiceClass, 'bg-white text-black text-center')}>
              Back
            </button>
            <button type='button' onClick={() => confirm({ type, out: lastManStanding ? 's' : out, runs, ...(fielder !== null && { fielder }) })} className={cn(choiceClass, 'bg-sporty-red text-center')}>
              Confirm
            </button>
          </div>
        </>
      )}

    </FormDialog>
  )
}
