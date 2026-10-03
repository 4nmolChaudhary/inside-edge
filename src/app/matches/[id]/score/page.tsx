import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getScorerMatch } from '@/db/queries/scoring'
import { isAuthorized } from '@/lib/authorize'
import { ScorerScreen } from '@/components/scorer/scorer-screen'

const MatchScore = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams
  if (!(await isAuthorized())) redirect(arena ? `/matches/${id}/live?arena=${arena}` : `/matches/${id}/live`)

  const match = arena ? await getScorerMatch(id, arena) : null
  if (arena && match && match.snapshot.status === 'setup') redirect(`/scoring/${id}?arena=${arena}`)

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/fixtures?arena=${arena}` : '/fixtures'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl leading-none text-white uppercase'>Scoring</span>
        </div>
        {!arena || !match ? <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Match not found</div> : <ScorerScreen arenaId={arena} match={match} />}
      </div>
    </div>
  )
}

export default MatchScore
