'use client'
import { Dialog } from 'radix-ui'

// same look as the digit boxes in components/form/code.tsx
export const dialogInputClass = 'h-16 rounded-xl border-0 bg-white dark:bg-white px-4 py-0 text-3xl text-black shadow-none outline-none placeholder:text-black/40 focus:ring-4 focus:ring-black'

type FormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
}

export const FormDialog = ({ open, onOpenChange, title, description, children }: FormDialogProps) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className='fixed inset-0 z-50 bg-black/60' />
      <Dialog.Content
        aria-describedby={undefined}
        className='fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-cyan p-6 font-(family-name:--font-display) flex flex-col gap-6'
      >
        <Dialog.Title className='text-center text-5xl uppercase'>{title}</Dialog.Title>
        {description && <p className='text-center text-lg font-(family-name:--font-inter-tight)'>{description}</p>}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
