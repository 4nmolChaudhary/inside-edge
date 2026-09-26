import Link from 'next/link'
import Image from 'next/image'

import { cn } from '@/lib/utils'
import CharacterTwo from '@/assets/images/character-2.png'
import CharacterThree from '@/assets/images/character-3.png'
import CharacterFour from '@/assets/images/character-4.png'
import CharacterFive from '@/assets/images/character-5.png'
import CharacterSix from '@/assets/images/character-6.png'

const tiles = [
  { id: 'fixtures', name: 'Fixtures', href: '/fixtures', image: CharacterTwo, className: 'col-span-2', imageClass: 'scale-110 right-5 bottom-2' },
  { id: 'teams', name: 'Teams', href: '/teams', image: CharacterThree, className: '', imageClass: '' },
  { id: 'players', name: 'Players', href: '/players', image: CharacterFour, className: '', imageClass: '' },
  { id: 'stats', name: 'Stats', href: '/stats', image: CharacterFive, className: '', imageClass: 'scale-125 right-3 bottom-2' },
  { id: 'more', name: 'More', href: '/more', image: CharacterSix, className: '', imageClass: 'scale-110 right-3 bottom-2' },
]

const Home = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams
  const hrefFor = (href: string) => (arena ? `${href}?arena=${arena}` : href)

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full p-4 grid grid-cols-2 grid-rows-[minmax(0,4fr)_minmax(0,3fr)_minmax(0,3fr)] gap-3 z-10'>
        {tiles.map(tile => (
          <Link key={tile.id} href={hrefFor(tile.href)} className={cn('relative flex flex-col justify-between overflow-hidden rounded-xl p-4 transition-transform active:scale-[0.98] bg-violet text-white', tile.className)}>
            <span className='relative z-10 text-5xl uppercase leading-none'>{tile.name}</span>
            <Image src={tile.image} loading='eager' alt='' className={cn('absolute right-0 bottom-0 h-3/4 w-auto max-w-full object-contain', tile.imageClass)} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home

