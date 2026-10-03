'use client'
import { useState } from 'react'

import { FormDialog } from '@/components/more/form-dialog'
import { PlayerChoice, toOptions } from '@/components/scorer/player-choice'
import { choiceClass, choiceSelectedClass, noop } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'
import type { BatterStat, SquadPlayer } from '@/lib/scoring'

export type CreaseEnd = 'striker' | 'nonStriker'

type NewBatterDialogProps = {
  open: boolean
  squad: SquadPlayer[]
  available: number[] // yet to bat
  retired: number[] // retired not out, may return
  batters: BatterStat[] // for the retired batters' current scores
  vacated: CreaseEnd
  runOut: boolean
  // the crease is empty: two batters are needed, one after the other
  vacancies: 1 | 2
  // one batter is left and only retired batters can return: offer to carry on alone
  canGoSolo: boolean
  onSelect: (index: number, end: CreaseEnd) => void
  onSolo: () => void
}

const Heading = ({ children }: { children: React.ReactNode }) => <div className='text-center text-lg uppercase'>{children}</div>

// Blocking: opens after a wicket or a retirement while someone is left to bat (or to return). After a run out the scorer also picks the end.
// Mount with a `key` that changes per event so the end selection resets.
export const NewBatterDialog = ({ open, squad, available, retired, batters, vacated, runOut, vacancies, canGoSolo, onSelect, onSolo }: NewBatterDialogProps) => {
  const [end, setEnd] = useState<CreaseEnd>(vacated)
  const [soloChoice, setSoloChoice] = useState(false)

  // with a returning batter on offer and one batter left, ask first: bring someone back or continue alone
  const asking = canGoSolo && !soloChoice
  const retiredOptions = toOptions(squad, retired).map(option => {
    const stat = batters.find(batter => batter.index === option.index)
    return { ...option, hint: stat ? `${stat.runs} (${stat.balls})` : option.hint }
  })

  return (
    <FormDialog
      open={open}
      onOpenChange={noop}
      title='New batter'
      description={vacancies === 2 ? 'Both batters are gone. Pick who comes in first' : asking ? 'One batter left. Bring back a retired batter or continue solo' : runOut ? 'Pick the next batter and which end they take' : 'Pick the next batter'}
    >
      {asking ? (
        <div className='grid grid-cols-2 gap-3'>
          <button type='button' onClick={() => setSoloChoice(true)} className={cn(choiceClass, 'py-5 text-center')}>
            Bring back a retired batter
          </button>
          <button type='button' onClick={onSolo} className={cn(choiceClass, 'py-5 text-center')}>
            Continue solo (last man standing)
          </button>
        </div>
      ) : (
        <>
          {runOut && vacancies === 1 && (
            <div className='grid grid-cols-2 gap-3'>
              {(['striker', 'nonStriker'] as const).map(option => (
                <button key={option} type='button' onClick={() => setEnd(option)} className={cn(choiceClass, 'text-center', end === option && choiceSelectedClass)}>
                  {option === 'striker' ? 'On strike' : 'Non-striker'}
                </button>
              ))}
            </div>
          )}
          {available.length > 0 && (
            <>
              {retired.length > 0 && <Heading>Yet to bat</Heading>}
              <PlayerChoice options={toOptions(squad, available)} onSelect={index => onSelect(index, runOut && vacancies === 1 ? end : vacated)} />
            </>
          )}
          {retired.length > 0 && (
            <>
              <Heading>Retired – can return</Heading>
              <PlayerChoice options={retiredOptions} onSelect={index => onSelect(index, runOut && vacancies === 1 ? end : vacated)} />
            </>
          )}
        </>
      )}
    </FormDialog>
  )
}
