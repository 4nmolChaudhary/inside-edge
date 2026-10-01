import { redirect } from 'next/navigation'

import { getMatchById } from '@/db/queries/matches'
import { getTeamsByArena } from '@/db/queries/teams'
import { getPlayersByArena } from '@/db/queries/players'
import { SetupWizard } from '@/components/scoring/setup-wizard'

const ScoringResume = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams

  const match = arena ? await getMatchById(id, arena) : null
  if (arena && match && match.status !== 'setup') redirect(`/matches/${id}/score?arena=${arena}`)

  const [teams, players] = arena ? await Promise.all([getTeamsByArena(arena), getPlayersByArena(arena)]) : [[], []]

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>{!arena ? <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Join an arena to continue</div> : !match ? <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Match not found</div> : <SetupWizard arenaId={arena} teams={teams} players={players} match={match} />}</div>
    </div>
  )
}

export default ScoringResume

