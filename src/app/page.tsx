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
      {/* <div className='w-full flex flex-col gap-3 justify-center'>
              <h2 className='text-3xl md:text-6xl font-(family-name:--font-display) tracking-tight uppercase'>🔰 Titans</h2>
              <div className='mb-2 text-sm opacity-75 font-(family-name:--font-geist-mono)'>A powerful fitness companion designed to track, analyze, and optimize your training progress. Simple, intuitive, and built to help you achieve your fitness goals.</div>
              <Button className='mb-4 cursor-pointer rounded-0! font-(family-name:--font-display) uppercase text-base'>Start Now 🔥</Button>
            </div> */}
      {/* <div className='px-2 py-6 mb-2 text-sm text-center opacity-75 font-(family-name:--font-geist-mono)'>Track every session, stay consistent, and see real progress. For free. Forever.</div> */}
    </div>
  )
}

