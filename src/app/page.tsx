'use client'

import { authClient } from '@/lib/auth-client'
import { X } from 'lucide-react'
import { USER_ROLES } from '@/constants/player'

import Main from '@/components/scorer/main'

export default function Home() {
  const { data: session } = authClient.useSession()
  const isScorer = session?.user?.role === USER_ROLES.SCORER

  const date = new Date().toDateString().split(' ')
  function getDayNightEmoji() {
    const hour = new Date().getHours()
    return hour >= 6 && hour < 18 ? '☀️' : '🌙'
  }

  if (isScorer) return <Main />
  return (
    <div className='flex h-dvh flex-col items-center justify-items-center w-full font-(family-name:--font-inter-tight)'>
      <div className='w-full flex items-center justify-between'>
        <div className='flex flex-col'>
          <div className='text-sm text-neutral-200'>
            {date[0]} {getDayNightEmoji()}
          </div>
          <div className='text-sm opacity-90'>{`${date[2]} ${date[1]}, ${date[3]}`}</div>
          <div className='mb-2 text-sm opacity-75 font-(family-name:--font-geist-mono)'>ICC Men's T20 World Cup, 2026 Super 8</div>
        </div>
        <div className='w-16 h-16 rounded-full bg-card flex items-center justify-center cursor-pointer'>
          <X />
        </div>
      </div>
    </div>
  )
}

