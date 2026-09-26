import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { TeamList } from '@/components/teams/team-list'

const Teams = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/home?arena=${arena}` : '/home'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl uppercase leading-none text-white'>Teams</span>
        </div>
        <TeamList arenaId={arena} />
      </div>
    </div>
  )
}

export default Teams

