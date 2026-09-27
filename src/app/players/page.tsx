import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getPlayersByArena } from '@/db/queries/players'
import { PlayerCard } from '@/components/players/player-card'

const Players = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams
  const players = arena ? await getPlayersByArena(arena) : []

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide overflow-auto'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/home?arena=${arena}` : '/home'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl uppercase leading-none text-white'>Players</span>
        </div>
        {players.length > 0 ? (
          <div className='grid grid-cols-2 content-start gap-3 p-4 pt-1'>
            {players.map(player => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>{arena ? 'No players yet' : 'Join an arena to see players'}</div>
        )}
      </div>
    </div>
  )
}

export default Players

