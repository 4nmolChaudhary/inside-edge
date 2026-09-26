import type { StaticImageData } from 'next/image'

import Bears from '@/assets/images/teams/bears.png'
import Bulls from '@/assets/images/teams/bulls.png'
import Jaguars from '@/assets/images/teams/jaguars.png'
import Panthers from '@/assets/images/teams/panthers.png'
import Rhinos from '@/assets/images/teams/rhinos.png'
import Tigers from '@/assets/images/teams/tigers.png'

// keyed by the teams.logo_url value (image name without extension)
export const TEAM_IMAGES: Record<string, StaticImageData> = {
  bears: Bears,
  bulls: Bulls,
  jaguars: Jaguars,
  panthers: Panthers,
  rhinos: Rhinos,
  tigers: Tigers,
}

export const TEAM_COLORS: Record<string, string> = {
  bears: '#ff4c02',
  bulls: '#056839',
  jaguars: '#ffc718',
  panthers: '#ff296f',
  rhinos: '#b8b6c4',
  tigers: '#ffac32',
}

