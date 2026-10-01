import { getTeamsByArena } from '@/db/queries/teams'
import { getPlayersByArena } from '@/db/queries/players'
import { SetupWizard } from '@/components/scoring/setup-wizard'

const ScoringSetup = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams
  const [teams, players] = arena ? await Promise.all([getTeamsByArena(arena), getPlayersByArena(arena)]) : [[], []]

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-background scrollbar-hide'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>{arena ? <SetupWizard arenaId={arena} teams={teams} players={players} /> : <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Join an arena to start scoring</div>}</div>
    </div>
  )
}

export default ScoringSetup

