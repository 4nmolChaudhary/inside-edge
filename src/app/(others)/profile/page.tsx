'use client'
import { authClient } from '@/lib/auth-client'
import Image from 'next/image'

import PlayerZero from '@/assets/images/player-zero.png'
import { UserPen, AlertTriangle } from 'lucide-react'

import { LabelValue } from '@/components/others/label-value'

const Profile = () => {
  const { data: session } = authClient.useSession()
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
          <Image src={PlayerZero} alt='profile picture' className='w-full' />
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
        <div className='w-full h-full border-b border-primary/50 border-dashed p-4 flex items-center justify-center cursor-pointer'>
          <UserPen size={32} />
        </div>
        <LabelValue label='Batting Style' value={session?.user?.battingStyle || '??'} primaryClassname='col-span-5 p-3 border-b border-primary/50 border-dashed' />
        <LabelValue label='Bowling Style' value={session?.user?.bowlingStyle || '??'} primaryClassname='col-span-5 p-3 border-b border-primary/50 border-dashed' />
        <LabelValue label='Playing Role' value={session?.user?.playingRole || '??'} primaryClassname='col-span-5 p-3' />
      </div>
    </div>
  )
}

export default Profile
