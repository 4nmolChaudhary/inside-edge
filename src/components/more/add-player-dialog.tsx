'use client'
import { useState } from 'react'

import { Button } from '@/components/form/button'
import { TextInput } from '@/components/form/text-input'
import { FormDialog, dialogInputClass } from '@/components/more/form-dialog'
import { useAddPlayer } from '@/api/players'

const EMPTY = { firstName: '', lastName: '', number: '' }

type AddPlayerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  arenaId: string
}

export const AddPlayerDialog = ({ open, onOpenChange, arenaId }: AddPlayerDialogProps) => {
  const [form, setForm] = useState(EMPTY)
  const { mutate, isPending } = useAddPlayer({
    onSuccess: () => {
      setForm(EMPTY)
      onOpenChange(false)
    },
  })

  const valid = form.firstName.trim() !== '' && form.lastName.trim() !== ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || isPending) return
    mutate({ arenaId, firstName: form.firstName, lastName: form.lastName, number: form.number === '' ? null : Number(form.number) })
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title='Add Player'>
      <form onSubmit={submit} className='flex flex-col'>
        <TextInput inputClassName={dialogInputClass} label='First name' placeholder='First name' maxLength={50} autoComplete='off' value={form.firstName} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} />
        <TextInput inputClassName={dialogInputClass} label='Last name' placeholder='Last name' maxLength={50} autoComplete='off' value={form.lastName} onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} />
        <TextInput inputClassName={dialogInputClass} label='Number (optional)' placeholder='e.g. 10' inputMode='numeric' maxLength={2} autoComplete='off' value={form.number} onChange={e => setForm(prev => ({ ...prev, number: e.target.value.replace(/\D/g, '') }))} />
        <div className='w-full flex justify-center pt-2'>
          <Button type='submit' text='Add' loadingText='Adding...' loading={isPending} disabled={!valid} />
        </div>
      </form>
    </FormDialog>
  )
}
