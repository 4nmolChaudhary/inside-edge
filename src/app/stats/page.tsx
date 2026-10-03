import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { getStatLeaders } from '@/db/queries/stats'

const Stats = async ({ searchParams }: { searchParams: Promise<{ arena?: string; type?: string }> }) => {
  const { arena, type } = await searchParams
  const categories = arena ? await getStatLeaders(arena) : []
  const selected = categories.find(category => category.key === type) ?? categories[0]

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card scrollbar-hide overflow-auto'>
      <div className='lg:w-132 h-dvh w-full flex flex-col z-10'>
        <div className='flex items-center gap-3 p-4 pb-3'>
          <Link href={arena ? `/home?arena=${arena}` : '/home'} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
            <ArrowLeft size={22} />
          </Link>
          <span className='text-5xl uppercase leading-none text-white'>Stats</span>
        </div>
        {selected ? (
          <>
            <nav aria-label='Stat type' className='flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide'>
              {categories.map(category => (
                <Link
                  key={category.key}
                  href={`/stats?arena=${arena}&type=${category.key}`}
                  replace
                  aria-current={category.key === selected.key ? 'page' : undefined}
                  className={`shrink-0 rounded-xl px-3 py-2 text-lg uppercase leading-none transition-transform active:scale-[0.98] ${category.key === selected.key ? 'bg-violet text-white' : 'bg-white/5 text-white/60'}`}
                >
                  {category.title}
                </Link>
              ))}
            </nav>
            <div className='flex flex-1 flex-col gap-2 overflow-auto p-4 pt-1'>
              {selected.leaders.length > 0 ? (
                <ol className='flex flex-col gap-2'>
                  {selected.leaders.map((leader, index) => (
                    <li key={leader.playerId}>
                      <Link href={`/players/${leader.playerId}?arena=${arena}`} className='flex items-center gap-3 rounded-xl bg-white/5 p-3 text-white transition-transform active:scale-[0.98]'>
                        <span className='w-8 text-center text-2xl leading-none text-white/50'>{index + 1}</span>
                        <span className='min-w-0 flex-1 truncate text-xl uppercase'>{leader.name}</span>
                        {leader.detail && <span className='text-sm uppercase text-white/50 font-(family-name:--font-inter-tight)'>{leader.detail}</span>}
                        <span className='text-3xl leading-none text-lime'>{leader.value}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>No data yet</div>
              )}
            </div>
          </>
        ) : (
          <div className='flex flex-1 items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>{arena ? 'No stats yet' : 'Join an arena to see stats'}</div>
        )}
      </div>
    </div>
  )
}

export default Stats
