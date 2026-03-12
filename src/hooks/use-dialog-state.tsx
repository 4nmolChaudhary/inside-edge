import { useState } from 'react'

const useDialogState = () => {
  const [isOpen, setOpen] = useState(false)
  const onOpenChange = () => setOpen(!isOpen)
  const onClose = () => setOpen(false)
  return { isOpen, onOpenChange, onClose }
}

export default useDialogState
