'use client'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import Image from 'next/image'

import { PROFILE_IMAGES } from '@/constants/images'
import { UserPen, AlertTriangle } from 'lucide-react'

import { LabelValue } from '@/components/others/label-value'
import EditProfile from '@/components/profile/edit-profile'
import { startCase } from 'lodash'

const Profile = () => {
  const { data: session } = authClient.useSession()
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) return <EditProfile user={session?.user} onCancel={() => setIsEditing(false)} />
  return (
    <div className='w-full h-[calc(100%-124px)] gap-3 text-2xl font-(family-name:--font-display)'>
      <div className='grid w-full border-b border-primary/50 border-dashed'>
        <div className='flex flex-col gap-4 relative'>
          {!session?.user?.emailVerified && (
            <div className='p-2 w-auto flex items-center gap-2 absolute top-2 right-2 bg-amber-300 text-black'>
              <AlertTriangle className='h-4 w-4' />
              <div className='text-sm font-(family-name:--font-inter-tight)'>Complete Your Profile</div>
            </div>
          )}
          <Image src={PROFILE_IMAGES[Number(session?.user?.image) || 0]} alt='profile picture' className='w-5/6 mx-auto' />
          <div className='absolute bottom-4 left-4'>
            <LabelValue label='Name' value={session?.user?.name || 'unknown'} valueClassName='text-5xl' />
          </div>
        </div>
      </div>
      <div className='grid grid-cols-5 w-full'>
        <div className='w-full h-full border-b border-r border-primary/50 border-dashed p-4 flex items-center justify-center'>
          <div className='bg-[url(/images/t-shirt.png)] bg-cover bg-center w-16 h-16'>
            <div className='flex items-center justify-center text-white text-xl pt-4'>{session?.user?.jerseyNumber || '??'}</div>
          </div>
        </div>
        <LabelValue label='Age' value={session?.user?.age || '??'} primaryClassname='col-span-3 p-3 border-b border-r border-primary/50 border-dashed' />
        <div className='w-full h-full border-b border-primary/50 border-dashed p-4 flex items-center justify-center cursor-pointer' onClick={() => setIsEditing(true)}>
          <UserPen size={32} />
        </div>
        <LabelValue label='Batting Style' value={startCase(session?.user?.battingStyle || '') || '??'} primaryClassname='col-span-5 p-3 border-b border-primary/50 border-dashed' />
        <LabelValue label='Bowling Style' value={startCase(session?.user?.bowlingStyle || '') || '??'} primaryClassname='col-span-5 p-3 border-b border-primary/50 border-dashed' />
        <LabelValue label='Playing Role' value={startCase(session?.user?.playingRole || '') || '??'} primaryClassname='col-span-5 p-3' />
      </div>
    </div>
  )
}

export default Profile
