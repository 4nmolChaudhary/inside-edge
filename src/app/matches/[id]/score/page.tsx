import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getMatchDetail } from '@/db/queries/matches'
import { TeamBadge } from '@/components/matches/team-badge'

const MatchScore = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams
  const match = arena ? await getMatchDetail(id, arena) : null

  if (arena && match && match.status === 'setup') redirect(`/scoring/${id}?arena=${arena}`)

  const battingFirstTeam = match ? (match.battingFirstId === match.teamA.id ? match.teamA : match.teamB) : null
  const bowlingFirstTeam = match && battingFirstTeam ? (battingFirstTeam.id === match.teamA.id ? match.teamB : match.teamA) : null
  const currentBattingTeam = match && battingFirstTeam && bowlingFirstTeam ? (match.currentInnings === 1 ? battingFirstTeam : bowlingFirstTeam) : null

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/fixtures?arena=${arena}` : '/fixtures'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl leading-none text-white uppercase'>Live</span>
        </div>
        {!arena || !match ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Match not found</div>
        ) : (
          <div className='flex flex-1 flex-col gap-6 p-4'>
            <div className='flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4'>
              <TeamBadge name={match.teamA.name} shortName={match.teamA.shortName} logoUrl={match.teamA.logoUrl} />
              <span className='text-lg text-white/60 uppercase'>vs</span>
              <TeamBadge name={match.teamB.name} shortName={match.teamB.shortName} logoUrl={match.teamB.logoUrl} />
            </div>
            <div className='text-center text-lg text-white/70 uppercase'>
              {battingFirstTeam?.name} won the toss and chose to {match.tossDecision}
            </div>
            <div className='text-center text-2xl text-lime uppercase'>{currentBattingTeam?.name} are batting</div>
            <div className='flex flex-1 items-center justify-center text-center text-2xl text-white/60 uppercase'>Ball-by-ball scoring coming soon</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchScore

