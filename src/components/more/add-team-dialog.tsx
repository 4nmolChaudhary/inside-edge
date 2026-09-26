'use client'
import { useState } from 'react'

import { Button } from '@/components/form/button'
import { TextInput } from '@/components/form/text-input'
import { FormDialog, dialogInputClass } from '@/components/more/form-dialog'
import { useAddTeam } from '@/api/teams'

const EMPTY = { name: '', shortName: '' }

type AddTeamDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  arenaId: string
}

export const AddTeamDialog = ({ open, onOpenChange, arenaId }: AddTeamDialogProps) => {
  const [form, setForm] = useState(EMPTY)
  const { mutate, isPending } = useAddTeam({
    onSuccess: () => {
      setForm(EMPTY)
      onOpenChange(false)
    },
  })

  const valid = form.name.trim() !== ''

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || isPending) return
    mutate({ arenaId, ...form })
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title='Add Team'>
      <form onSubmit={submit} className='flex flex-col'>
        <TextInput inputClassName={dialogInputClass} label='Team name' placeholder='Team name' maxLength={60} autoComplete='off' value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} />
        <TextInput inputClassName={dialogInputClass} label='Short name (optional)' placeholder='e.g. MUM' maxLength={6} autoComplete='off' value={form.shortName} onChange={e => setForm(prev => ({ ...prev, shortName: e.target.value.toUpperCase() }))} />
        <div className='w-full flex justify-center pt-2'>
          <Button type='submit' text='Add' loadingText='Adding...' loading={isPending} disabled={!valid} />
        </div>
      </form>
    </FormDialog>
  )
}
