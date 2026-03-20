'use client'
import { useUsers } from '@/api/users'

import { PROFILE_IMAGES } from '@/constants/images'
import Image from 'next/image'

const Page = () => {
  const { data } = useUsers()
  console.log(data)
  return (
    <div className='w-full flex flex-col gap-3 text-2xl font-(family-name:--font-display)'>
      <div className='w-full h-[calc(100vh-170px)] text-2xl font-(family-name:--font-display) overflow-y-auto grid grid-cols-2 gap-4 p-4 scrollbar-hide'>
        {/* {data?.map(user => (
          <div key={user.id} className='flex p-4 items-center flex-col cursor-pointer'>
            <Image src={PROFILE_IMAGES[Number(user.image) || 0]} alt='profile picture' className='w-32 aspect-square object-cover' />
            <div className='w-full uppercase text-center'>{user.name}</div>
          </div>
        ))} */}
        {data?.map(user => (
          <div key={user.id} className='flex py-6 pb-0 flex-col cursor-pointer gap-2 relative bg-card'>
            <div className='text-gray-500 text-8xl uppercase absolute top-2 left-2 z-0'>{user.jerseyNumber || 99}</div>
            <div className='w-full aspect-square relative z-1'>
              <Image src={PROFILE_IMAGES[Number(user.image) || 0]} alt='profile picture' className='w-full aspect-square object-cover' />
            </div>
            <div className='flex flex-col -gap-4 absolute bottom-0 z-10'>
              <div className='text-black px-2 text-3xl uppercase bg-accent'>{user.name.split(' ')[0]}</div>
              <span className='text-white text-sm bg-primary px-2 uppercase w-auto'>{user.name.split(' ').slice(1).join(' ')}</span>
            </div>
            {/* <div>
              <div className='text-gray-400 text-xs uppercase tracking-widest font-medium'>{user.playingRole}</div>
              <div className='text-gray-500 text-xs uppercase tracking-widest font-medium'>
                {user.battingStyle} / ${user.bowlingStyle} / ${user.jerseyNumber}
              </div>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page
