import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'

import { getPlayerProfile } from '@/db/queries/stats'

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className='flex flex-col rounded-xl bg-white/5 p-3'>
    <span className='text-xs uppercase tracking-wide text-white/50 font-(family-name:--font-inter-tight)'>{label}</span>
    <span className='text-3xl leading-tight text-white'>{value}</span>
  </div>
)

const PlayerProfile = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams
  const profile = arena ? await getPlayerProfile(id, arena) : null
  const stats = profile?.stats

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide overflow-auto'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/players?arena=${arena}` : '/players'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl uppercase leading-none text-white'>Player</span>
        </div>
        {!profile ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Player not found</div>
        ) : (
          <div className='flex flex-1 flex-col gap-4 overflow-auto p-4 pt-1'>
            <div className='flex flex-col text-white'>
              <span className='text-5xl uppercase leading-none'>{profile.player.firstName}</span>
              <span className='text-2xl uppercase text-white/60'>
                {profile.player.lastName}
                {profile.player.number !== null && ` · #${profile.player.number}`}
              </span>
            </div>
            <div className='flex items-center gap-3 rounded-xl bg-white/5 p-4 text-white'>
              <Trophy size={28} className='text-yellow' />
              <span className='text-xl uppercase'>Player of the Match</span>
              <span className='ml-auto text-4xl leading-none text-lime'>{stats?.playerOfMatch ?? 0}</span>
            </div>
            <div className='grid grid-cols-3 gap-3'>
              <Stat label='Matches' value={stats?.matches ?? 0} />
              <Stat label='Runs' value={stats?.runs ?? 0} />
              <Stat label='Wickets' value={stats?.wickets ?? 0} />
              <Stat label='High score' value={stats ? `${stats.highScore}${stats.highScoreNotOut ? '*' : ''}` : 0} />
              <Stat label='Not outs' value={stats ? Math.max(stats.innings - stats.outs, 0) : 0} />
              <Stat label='Best bowling' value={stats?.bestWickets ? `${stats.bestWickets}/${stats.bestRuns}` : '-'} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayerProfile
