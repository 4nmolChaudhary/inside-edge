import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getScorerMatch } from '@/db/queries/scoring'
import { LiveView } from '@/components/scorer/live-view'

const MatchDetail = async ({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ arena?: string }> }) => {
  const { id } = await params
  const { arena } = await searchParams
  const match = arena ? await getScorerMatch(id, arena) : null

  if (arena && match && match.snapshot.status === 'setup') redirect(`/fixtures?arena=${arena}`)

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/fixtures?arena=${arena}` : '/fixtures'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl leading-none text-white uppercase'>Match</span>
        </div>
        {!arena || !match ? <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>Match not found</div> : <LiveView match={match} completed={match.snapshot.status === 'completed'} />}
      </div>
    </div>
  )
}

export default MatchDetail
