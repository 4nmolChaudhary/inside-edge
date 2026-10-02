import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getLiveMatchesByArena, getPastMatchesByArena, getSetupMatchesByArena } from '@/db/queries/matches'
import { isAuthorized } from '@/lib/authorize'
import { MatchCard } from '@/components/matches/match-card'

const Fixtures = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams
  const isAuthenticated = await isAuthorized()
  const [live, setup, past] = arena ? await Promise.all([getLiveMatchesByArena(arena), isAuthenticated ? getSetupMatchesByArena(arena) : [], getPastMatchesByArena(arena)]) : [[], [], []]

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) scrollbar-hide overflow-auto bg-background'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/home?arena=${arena}` : '/home'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl leading-none text-white uppercase'>Fixtures & Results</span>
        </div>
        {!arena ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Join an arena to see fixtures</div>
        ) : !live.length && !setup.length && !past.length ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>No matches yet</div>
        ) : (
          <div className='flex flex-1 flex-col gap-5 overflow-auto p-4 pt-0'>
            {!!live.length && live.map(match => <MatchCard key={match.id} match={match} arenaId={arena} isAuthenticated={isAuthenticated} />)}
            {!!setup.length && setup.map(match => <MatchCard key={match.id} match={match} arenaId={arena} isAuthenticated={isAuthenticated} />)}
            {!!past.length && past.map(match => <MatchCard key={match.id} match={match} arenaId={arena} isAuthenticated={isAuthenticated} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default Fixtures

