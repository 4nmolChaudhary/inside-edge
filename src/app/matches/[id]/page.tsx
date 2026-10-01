import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getMatchDetail } from '@/db/queries/matches'
import { TeamBadge } from '@/components/matches/team-badge'
import { formatOvers } from '@/lib/cricket'

const MatchDetail = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams
  const match = arena ? await getMatchDetail(id, arena) : null

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide overflow-auto'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/fixtures?arena=${arena}` : '/fixtures'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl leading-none text-white uppercase'>Match</span>
        </div>
        {!arena || !match ? (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Match not found</div>
        ) : (
          <div className='flex flex-1 flex-col gap-5 overflow-auto p-4 pt-0'>
            <div className='flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4'>
              <div className='flex flex-col items-start gap-1'>
                <TeamBadge name={match.teamA.name} shortName={match.teamA.shortName} logoUrl={match.teamA.logoUrl} />
                <span className='text-2xl text-white'>
                  {match.teamARuns}/{match.teamAWickets} <span className='text-sm text-white/50'>({formatOvers(match.teamABalls)})</span>
                </span>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <TeamBadge name={match.teamB.name} shortName={match.teamB.shortName} logoUrl={match.teamB.logoUrl} />
                <span className='text-2xl text-white'>
                  {match.teamBRuns}/{match.teamBWickets} <span className='text-sm text-white/50'>({formatOvers(match.teamBBalls)})</span>
                </span>
              </div>
            </div>

            {match.resultText && <div className='text-center text-xl text-lime uppercase'>{match.resultText}</div>}

            {match.tossWinnerId && (
              <div className='text-center text-lg text-white/70 uppercase'>
                {(match.tossWinnerId === match.teamA.id ? match.teamA : match.teamB).name} won the toss, chose to {match.tossDecision}
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <div className='pb-2 text-lg text-white/60 uppercase'>{match.teamA.name}</div>
                <ul className='flex flex-col gap-1'>
                  {match.teamARoster.map(player => (
                    <li key={player.id} className='text-lg text-white uppercase'>
                      {player.firstName} {player.lastName}
                      {match.teamACaptainId === player.id && <span className='text-white/50'> (C)</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className='pb-2 text-lg text-white/60 uppercase'>{match.teamB.name}</div>
                <ul className='flex flex-col gap-1'>
                  {match.teamBRoster.map(player => (
                    <li key={player.id} className='text-lg text-white uppercase'>
                      {player.firstName} {player.lastName}
                      {match.teamBCaptainId === player.id && <span className='text-white/50'> (C)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchDetail
