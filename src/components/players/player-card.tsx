import Image from 'next/image'

import CharacterBack from '@/assets/images/character-back.png'
import type { Player } from '@/db/schemas'

export const PlayerCard = ({ player }: { player: Player }) => (
  <div className='relative aspect-square overflow-hidden rounded-xl bg-violet p-4 text-white'>
    <div className='relative z-10 flex flex-col items-start'>
      <span className='text-4xl uppercase leading-none wrap-anywhere'>{player.firstName}</span>
      <span className='text-xl wrap-anywhere -mt-2 font-(family-name:--font-inter-tight) text-black'>{player.lastName}</span>
    </div>
    <div className='absolute -right-1 -bottom-2 h-3/4 scale-90'>
      <Image src={CharacterBack} alt='' className='h-full w-auto' />
      {player.number !== null && <span className='absolute top-[55%] left-[45%] -translate-x-1/2 -translate-y-1/2 text-5xl leading-none text-white'>{player.number}</span>}
    </div>
  </div>
)

