'use client'
import { useState } from 'react'
import { useAddTeam } from '@/api/teams'

import { Button } from '@/components/form/button'
import { TextInput } from '@/components/form/text-input'
import { ImageSelector } from '@/components/profile/image-selector'

import { TEAM_IMAGES } from '@/constants/images'

const AddEditTeam = ({ onCancel }: { onCancel: () => void }) => {
  const [form, setForm] = useState({ name: '', image: 0 })
  const { mutate, isPending } = useAddTeam({ onSuccess: onCancel })

  const handleSubmit = () => mutate(form)

  return (
    <div className='w-full h-[calc(100%-124px)] gap-3 text-2xl font-(family-name:--font-display) overflow-y-auto'>
      <div className='text-3xl font-(family-name:--font-display) tracking-tight uppercase p-4 pb-0'>add team</div>
      <div className='mb-4 text-sm text-neutral-500 font-(family-name:--font-inter-tight) px-4'>Enter your details to update your team information</div>
      <div className='grid grid-cols-2 gap-x-4 px-4'>
        <ImageSelector images={TEAM_IMAGES} currentIndex={form.image} onIndexChange={index => setForm(prev => ({ ...prev, image: index }))} className='col-span-2 h-45' />
        <TextInput label='Name' placeholder='Team name' value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} containerClasses='w-full col-span-2' />
        <Button className='cursor-pointer border border-primary/50 bg-transparent text-primary hover:bg-transparent' text='Cancel' onClick={onCancel} />
        <Button className='cursor-pointer mb-2' text='add' onClick={handleSubmit} loading={isPending} loadingText='adding...' />
      </div>
    </div>
  )
}

export default AddEditTeam
