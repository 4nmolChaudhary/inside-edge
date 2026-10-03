'use client'
import { FormDialog } from '@/components/more/form-dialog'
import { PlayerChoice, type PlayerOption } from '@/components/scorer/player-choice'
import { noop } from '@/components/scorer/styles'

type PlayerPickerDialogProps = {
  open: boolean
  title: string
  description?: string
  options: PlayerOption[]
  selected?: number | null
  disabled?: number[]
  warning?: string | null
  // omit for a blocking dialog that stays open until a player is picked
  onOpenChange?: (open: boolean) => void
  onSelect: (index: number) => void
}

export const PlayerPickerDialog = ({ open, title, description, options, selected, disabled, warning, onOpenChange, onSelect }: PlayerPickerDialogProps) => (
  <FormDialog open={open} onOpenChange={onOpenChange ?? noop} title={title} description={description}>
    {warning && <div className='rounded-xl bg-yellow px-4 py-2 text-center text-lg uppercase'>{warning}</div>}
    <PlayerChoice options={options} selected={selected} disabled={disabled} onSelect={onSelect} />
  </FormDialog>
)
