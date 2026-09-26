'use client'
import { useState } from 'react'

import { Button } from '@/components/form/button'
import { Code } from '@/components/form/code'
import { FormDialog } from '@/components/more/form-dialog'
import { useAuthorize } from '@/api/authorize'

const LENGTH = 6

type AuthorizeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthorized: () => void
}

export const AuthorizeDialog = ({ open, onOpenChange, onAuthorized }: AuthorizeDialogProps) => {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const { mutate, isPending } = useAuthorize({
    onSuccess: () => {
      setDigits(Array(LENGTH).fill(''))
      onAuthorized()
    },
  })

  const code = digits.join('')
  const complete = code.length === LENGTH

  const submit = () => {
    if (!complete || isPending) return
    mutate(code)
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title='Enter Code' description='Enter the 6 digit authorization code'>
      <div onKeyDown={e => e.key === 'Enter' && submit()}>
        <Code value={digits} setValue={setDigits} />
      </div>
      <div className='w-full flex justify-center'>
        <Button type='button' text='Authorize' loadingText='Verifying...' loading={isPending} disabled={!complete} onClick={submit} />
      </div>
    </FormDialog>
  )
}
