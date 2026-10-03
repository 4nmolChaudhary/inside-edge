'use client'
import { FormDialog } from '@/components/more/form-dialog'
import { choiceClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'

type TieDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  description: string
  busy?: boolean
  onSuperOver: () => void
  onCompleteAsTie: () => void
}

// The match innings ended level: play a one-over-each super over, or settle for a tie.
export const TieDialog = ({ open, onOpenChange, description, busy, onSuperOver, onCompleteAsTie }: TieDialogProps) => (
  <FormDialog open={open} onOpenChange={onOpenChange} title='Match tied' description={description}>
    <button type='button' disabled={busy} onClick={onSuperOver} className={cn(choiceClass, 'text-center')}>
      Play super over
    </button>
    <div className='grid grid-cols-2 gap-3'>
      <button type='button' onClick={() => onOpenChange(false)} className={cn(choiceClass, 'bg-white text-black text-center')}>
        Review
      </button>
      <button type='button' disabled={busy} onClick={onCompleteAsTie} className={cn(choiceClass, 'bg-white text-black text-center')}>
        End as tie
      </button>
    </div>
  </FormDialog>
)
