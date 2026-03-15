'use client'
import { useEffect, useState } from 'react'
import { useUpdateUser } from '@/api/users'

import { Button } from '@/components/form/button'
import { TextInput } from '@/components/form/text-input'
import { ImageSelector } from '@/components/profile/image-selector'

import { BATTING_STYLES, PLAYING_ROLES, BOWLING_STYLES } from '@/constants/player'
import { upperCase } from 'lodash'
import { cn } from '@/lib/utils'

import { User } from '@/types/user'

const EditProfile = ({ user, onCancel }: { user: User | undefined; onCancel: () => void }) => {
  const [form, setForm] = useState({ name: '', age: '', jerseyNumber: '', battingStyle: '', bowlingStyle: '', playingRole: '', image: 0, id: '' })
  const { mutate, isPending } = useUpdateUser({ onSuccess: onCancel })
  //
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        age: user.age ? String(user.age) : '',
        jerseyNumber: user.jerseyNumber ? String(user.jerseyNumber) : '',
        battingStyle: user.battingStyle ?? BATTING_STYLES.RIGHT_HAND,
        playingRole: user.playingRole ?? PLAYING_ROLES.ALLROUNDER,
        bowlingStyle: user.bowlingStyle ?? '',
        image: Number(user.image) ?? 0,
        id: user.id,
      })
    }
  }, [user])

  const handleSubmit = () => {
    mutate({ id: form.id, updates: { ...form, age: Number(form.age), jerseyNumber: Number(form.jerseyNumber), image: `${form.image}`, emailVerified: true } })
  }

  return (
    <div className='w-full h-[calc(100%-124px)] gap-3 text-2xl font-(family-name:--font-display) overflow-y-auto'>
      <div className='text-3xl font-(family-name:--font-display) tracking-tight uppercase p-4 pb-0'>edit profile</div>
      <div className='mb-4 text-sm text-neutral-500 font-(family-name:--font-inter-tight) px-4'>Enter your details to update your profile</div>
      <ImageSelector currentIndex={form.image} onIndexChange={index => setForm(prev => ({ ...prev, image: index }))} className='mb-4' />
      <div className='grid grid-cols-2 gap-x-4 px-4'>
        <TextInput label='Jersey #' placeholder='45' type='number' value={form.jerseyNumber} onChange={e => setForm(prev => ({ ...prev, jerseyNumber: e.target.value }))} containerClasses='w-full' />
        <TextInput label='Age' placeholder='25' type='number' value={form.age} onChange={e => setForm(prev => ({ ...prev, age: e.target.value }))} containerClasses='w-full' />
        <TextInput label='Name' placeholder='Rohit Doe' value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} containerClasses='w-full col-span-2' />
        <div className='w-full text-sm col-span-2'>
          <label className='text-sm font-(family-name:--font-display) uppercase opacity-50'>batting style</label>
          <div className='h-12 mb-4 font-(family-name:--font-inter-tight) border border-white/20 grid grid-cols-2'>
            {Object.values(BATTING_STYLES).map(style => (
              <div key={style} onClick={() => setForm(prev => ({ ...prev, battingStyle: style }))} className={cn('flex items-center justify-center p-2 text-white/20 cursor-pointer', form.battingStyle === style && 'bg-primary text-white')}>
                {upperCase(style)}
              </div>
            ))}
          </div>
        </div>
        <div className='w-full text-sm col-span-2'>
          <label className='text-sm font-(family-name:--font-display) uppercase opacity-50'>playing role</label>
          <div className='mb-4 font-(family-name:--font-inter-tight) border border-white/20 grid grid-cols-2'>
            {Object.values(PLAYING_ROLES).map((role, index) => (
              <div key={role} onClick={() => setForm(prev => ({ ...prev, playingRole: role }))} className={cn('h-12 flex items-center justify-center p-2 text-white/20 cursor-pointer', form.playingRole === role && 'bg-primary text-white', index % 2 === 0 && 'border-r border-primary/50 border-dashed', index < Object.keys(PLAYING_ROLES).length - 2 && 'border-b border-primary/50 border-dashed')}>
                {upperCase(role)}
              </div>
            ))}
          </div>
        </div>
        <div className='w-full text-sm col-span-2'>
          <label className='text-sm font-(family-name:--font-display) uppercase opacity-50'>bowling style</label>
          <div className='mb-4 font-(family-name:--font-inter-tight) border border-white/20 grid grid-cols-2'>
            {Object.values(BOWLING_STYLES).map((style, index) => (
              <div key={style} onClick={() => setForm(prev => ({ ...prev, bowlingStyle: style }))} className={cn('h-12 flex items-center justify-center p-2 text-white/20 cursor-pointer', form.bowlingStyle === style && 'bg-primary text-white', index % 2 === 0 && 'border-r border-primary/50 border-dashed', index < Object.keys(BOWLING_STYLES).length - 2 && 'border-b border-primary/50 border-dashed')}>
                {upperCase(style)}
              </div>
            ))}
          </div>
        </div>
        <Button className='cursor-pointer border border-primary/50 bg-transparent text-primary hover:bg-transparent' text='Cancel' onClick={onCancel} />
        <Button className='cursor-pointer mb-2' text='Update' onClick={handleSubmit} loading={isPending} loadingText='updating...' />
      </div>
    </div>
  )
}

export default EditProfile
