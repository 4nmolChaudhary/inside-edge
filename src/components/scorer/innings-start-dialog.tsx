'use client'
import { useState } from 'react'

import { Button } from '@/components/form/button'
import { FormDialog } from '@/components/more/form-dialog'
import { PlayerChoice, toOptions } from '@/components/scorer/player-choice'
import { noop } from '@/components/scorer/styles'
import type { SquadPlayer } from '@/lib/scoring'

export type InningsBreakSummary = { teamName: string; score: string; overs: string; target: number; chasingName: string }

type InningsStartDialogProps = {
  open: boolean
  battingSquad: SquadPlayer[]
  bowlingSquad: SquadPlayer[]
  battingName: string
  summary?: InningsBreakSummary
  superOver?: boolean
  onConfirm: (selection: { striker: number; nonStriker: number; bowler: number }) => void
}

const Heading = ({ children }: { children: React.ReactNode }) => <div className='text-center text-lg uppercase'>{children}</div>

// Blocking: opens at the start of each innings. In innings 2 it doubles as the innings break with the target.
export const InningsStartDialog = ({ open, battingSquad, bowlingSquad, battingName, summary, superOver = false, onConfirm }: InningsStartDialogProps) => {
  const [striker, setStriker] = useState<number | null>(null)
  const [nonStriker, setNonStriker] = useState<number | null>(null)
  const [bowler, setBowler] = useState<number | null>(null)

  // a team of one cannot have two openers; the engine treats the lone batter as last man standing
  const needsPair = battingSquad.length > 1
  const ready = striker !== null && bowler !== null && (!needsPair || nonStriker !== null)

  const submit = () => {
    if (!ready) return
    onConfirm({ striker, nonStriker: needsPair ? nonStriker! : striker, bowler })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={noop}
      title={superOver ? 'Super over' : summary ? 'Innings break' : 'Openers'}
      description={summary ? `${summary.teamName} ${summary.score} (${summary.overs}). ${summary.chasingName} need ${summary.target} to win.` : superOver ? `${battingName} bat first in the super over (1 over)` : `${battingName} to bat`}
    >
      <Heading>Striker</Heading>
      <PlayerChoice options={toOptions(battingSquad)} selected={striker} disabled={nonStriker === null ? [] : [nonStriker]} onSelect={setStriker} />
      {needsPair && (
        <>
          <Heading>Non-striker</Heading>
          <PlayerChoice options={toOptions(battingSquad)} selected={nonStriker} disabled={striker === null ? [] : [striker]} onSelect={setNonStriker} />
        </>
      )}
      <Heading>Opening bowler</Heading>
      <PlayerChoice options={toOptions(bowlingSquad)} selected={bowler} onSelect={setBowler} />
      <div className='flex w-full justify-center'>
        <Button type='button' text='Start innings' disabled={!ready} onClick={submit} />
      </div>
    </FormDialog>
  )
}
