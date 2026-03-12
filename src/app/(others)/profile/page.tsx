'use client'
import { authClient } from '@/lib/auth-client'
import Image from 'next/image'

import PlayerZero from '@/assets/images/player-zero.png'
import { cn } from '@/lib/utils'

const LabelValue = ({ label, value, className, valueClassName }: { label: string; value: string | number; className?: string; valueClassName?: string }) => {
  return (
    <div className='w-full'>
      <div className={cn('text-sm text-slate-500 font-(family-name:--font-inter-tight)', className)}>{label}</div>
      <div className={cn('text-4xl uppercase', valueClassName)}>{value}</div>
    </div>
  )
}
const Profile = () => {
  const { data: session } = authClient.useSession()
  const stats = ['Matches', 'Runs', 'HS', 'Bat Avg', 'Strike Rate', '50s', 'Wkts', 'BBI', 'Econ']
  console.log(session?.user)
  return (
    <div className='w-full h-[calc(100%-124px)] gap-3 text-2xl font-(family-name:--font-display)'>
      <div className='grid grid-cols-2 w-full border-b border-primary/50 border-dashed'>
        <div className='flex flex-col gap-4 relative border-r border-primary/50 border-dashed'>
          <Image src={PlayerZero} alt='profile picture' width={300} height={450} />
          <div className='bg-[url(/images/t-shirt.png)] bg-cover bg-center w-15 h-15 pt-4 absolute inset-2'>
            <div className='flex items-center justify-center text-white text-xl'>45</div>
          </div>
        </div>
        <div className='p-4'>
          <LabelValue label='Name' value={session?.user?.name || 'unknown'} />
          <LabelValue label='Age' value={session?.user?.age || '24'} />
          <LabelValue label='Batting Style' value={session?.user?.battingStyle || 'RHB'} />
          <LabelValue label='Bowling Style' value={session?.user?.bowlingStyle || 'WK'} />
          <LabelValue label='Playing Role' value={session?.user?.playingRole || 'WK Batter'} />
        </div>
      </div>
      <div className='p-4 border-b border-primary/50 border-dashed'>
        <div className='text-2xl uppercase'>stats</div>
      </div>
      <div className='grid grid-cols-3 grid-rows-3 w-full'>
        {stats.map(stat => (
          <div key={stat} className='flex flex-col items-center justify-center gap-2 border-r border-b border-primary/50 border-dashed'>
            <LabelValue label={stat} value={'-'} className='p-2 border-b border-primary/50 border-dashed text-center' valueClassName='text-center p-3' />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
