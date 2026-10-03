'use client'
import { FormDialog } from '@/components/more/form-dialog'
import { choiceClass } from '@/components/scorer/styles'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText: string
  cancelText?: string
  destructive?: boolean
  onConfirm: () => void
}

export const ConfirmDialog = ({ open, onOpenChange, title, description, confirmText, cancelText = 'Cancel', destructive, onConfirm }: ConfirmDialogProps) => (
  <FormDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
    <div className='grid grid-cols-2 gap-3'>
      <button type='button' onClick={() => onOpenChange(false)} className={cn(choiceClass, 'bg-white text-black text-center')}>
        {cancelText}
      </button>
      <button type='button' onClick={onConfirm} className={cn(choiceClass, 'text-center', destructive && 'bg-sporty-red')}>
        {confirmText}
      </button>
    </div>
  </FormDialog>
)
