import { Trophy } from 'lucide-react'

import { matchPlayers, potmMatchOf } from '@/components/scorer/match-view'
import type { MatchView } from '@/components/scorer/match-view'
import { captionClass, panelClass } from '@/components/scorer/styles'
import { formatMatchFigures, matchFigures } from '@/lib/scoring'

// The award on a completed match: name, team and the match figures, e.g. "34 (18) & 2/12".
// It is always the top performer by the points formula, never a manual pick.
export const PotmCard = ({ view, playerOfMatchId }: { view: MatchView; playerOfMatchId: string | null }) => {
  const winner = matchPlayers(view).find(player => player.id === playerOfMatchId)
  if (!winner) return null

  const figures = formatMatchFigures(matchFigures(winner.id, potmMatchOf(view, null), view.inn1, view.inn2))

  return (
    <div className={`${panelClass} flex items-center gap-3`}>
      <Trophy size={28} className='shrink-0 text-yellow' />
      <div className='flex min-w-0 flex-1 flex-col'>
        <span className={captionClass}>Player of the match</span>
        <span className='truncate text-3xl uppercase leading-tight text-white'>{winner.name}</span>
        <span className='text-sm uppercase text-white/60 font-(family-name:--font-inter-tight)'>
          {winner.teamName} · {figures}
        </span>
      </div>
    </div>
  )
}
