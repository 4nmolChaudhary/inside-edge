import Image from 'next/image'

import { TEAM_COLORS, TEAM_IMAGES } from '@/constants/images'
import { cn } from '@/lib/utils'

const DEFAULT_COLOR = '#7c4dff'

export const TeamLogo = ({ logoUrl, className, size }: { logoUrl?: string | null; size?: string; className?: string }) => {
  const logo = logoUrl ?? ''
  const color = TEAM_COLORS[logo] ?? DEFAULT_COLOR
  const image = TEAM_IMAGES[logo]

  return (
    <div className={className} style={{ backgroundColor: color }}>
      {image && <Image src={image} alt='' className={size} />}
    </div>
  )
}

type TeamBadgeProps = {
  name: string
  shortName?: string | null
  logoUrl?: string | null
  className?: string
  nameClassName?: string
}

export const TeamBadge = ({ name, shortName, logoUrl, className, nameClassName }: TeamBadgeProps) => (
  <div className={cn('flex min-w-0 items-center gap-2', className)}>
    <TeamLogo logoUrl={logoUrl} size='w-20' className='rounded-md' />
    <span className={cn('truncate text-3xl uppercase leading-none', nameClassName)}>{name}</span>
  </div>
)

