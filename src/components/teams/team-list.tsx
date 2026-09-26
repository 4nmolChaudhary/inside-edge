'use client'
import Image from 'next/image'

import { useTeams } from '@/api/teams'
import { TEAM_COLORS, TEAM_IMAGES } from '@/constants/images'
import type { Team } from '@/db/schemas'

const DEFAULT_COLOR = '#7c4dff'

// black text on light backgrounds, white on dark ones
const textColorFor = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16))
  return r * 0.299 + g * 0.587 + b * 0.114 > 150 ? '#000000' : '#ffffff'
}

const TeamCard = ({ team }: { team: Team }) => {
  const logo = team.logoUrl ?? ''
  const color = TEAM_COLORS[logo] ?? DEFAULT_COLOR
  const image = TEAM_IMAGES[logo]

  return (
    <div className='relative aspect-square overflow-hidden rounded-xl p-4' style={{ backgroundColor: color, color: textColorFor(color) }}>
      <div className='relative z-10 flex flex-col items-start'>
        <span className='text-4xl uppercase leading-none wrap-anywhere'>{team.name}</span>
        {team.shortName && <span className='text-lg uppercase opacity-70'>{team.shortName}</span>}
      </div>
      {image && <Image src={image} alt='' className='absolute right-0 bottom-0 h-2/3 w-auto max-w-full object-contain' />}
    </div>
  )
}

const Message = ({ children }: { children: React.ReactNode }) => <div className='flex h-full items-center justify-center p-4 text-center text-3xl uppercase text-white/60'>{children}</div>

export const TeamList = ({ arenaId }: { arenaId?: string }) => {
  const { data: teams, isLoading, isError } = useTeams(arenaId)

  if (!arenaId) return <Message>Join an arena to see teams</Message>
  if (isLoading) return <Message>Loading...</Message>
  if (isError) return <Message>Could not load teams</Message>
  if (!teams?.length) return <Message>No teams yet</Message>

  return (
    <div className='grid grid-cols-2 content-start gap-3 p-4'>
      {teams.map(team => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  )
}
