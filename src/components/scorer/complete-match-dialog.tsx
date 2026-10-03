'use client'
import { FormDialog } from '@/components/more/form-dialog'
import type { MatchPlayer } from '@/components/scorer/match-view'
import { choiceClass } from '@/components/scorer/styles'
import { describeBreakdown } from '@/lib/scoring'
import type { PotmCandidate } from '@/lib/scoring'
import { cn } from '@/lib/utils'

type CompleteMatchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText: string
  cancelText?: string
  // best first, from suggestPlayerOfMatch
  ranking: PotmCandidate[]
  players: MatchPlayer[]
  onConfirm: () => void
}

// Final confirmation: the result plus the Player of the Match picked by the points formula, with its breakdown
// and the next three performers. The award is automatic so it cannot be swayed by who is scoring.
export const CompleteMatchDialog = ({ open, onOpenChange, title, description, confirmText, cancelText = 'Review', ranking, players, onConfirm }: CompleteMatchDialogProps) => {
  const nameOf = (id: string) => players.find(player => player.id === id)
  const [top, ...rest] = ranking
  const winner = top ? nameOf(top.playerId) : undefined

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={title} description={description}>
      {top && winner && (
        <div className='flex flex-col gap-2 rounded-xl bg-black p-4 text-white'>
          <span className='text-xs uppercase tracking-wide text-white/50 font-(family-name:--font-inter-tight)'>Player of the match</span>
          <div className='flex items-baseline justify-between gap-3'>
            <span className='truncate text-3xl uppercase leading-tight'>{winner.name}</span>
            <span className='text-2xl text-lime'>{top.points} pts</span>
          </div>
          <span className='text-sm uppercase text-white/60 font-(family-name:--font-inter-tight)'>{winner.teamName}</span>
          <span className='text-sm uppercase text-white/70 font-(family-name:--font-inter-tight)'>{describeBreakdown(top.breakdown).join(' · ') || 'No points yet'}</span>
        </div>
      )}

      {rest.length > 0 && (
        <div className='flex flex-col gap-2'>
          <div className='text-center text-lg uppercase'>Next best</div>
          {rest.slice(0, 3).map(item => (
            <div key={item.playerId} className='flex items-baseline justify-between gap-3 rounded-xl bg-black/60 px-3 py-2 text-xl uppercase text-white'>
              <span className='truncate'>{nameOf(item.playerId)?.name ?? 'Player'}</span>
              <span className='text-base text-white/60'>{item.points} pts</span>
            </div>
          ))}
        </div>
      )}

      <div className='grid grid-cols-2 gap-3'>
        <button type='button' onClick={() => onOpenChange(false)} className={cn(choiceClass, 'bg-white text-black text-center')}>
          {cancelText}
        </button>
        <button type='button' onClick={onConfirm} className={cn(choiceClass, 'text-center')}>
          {confirmText}
        </button>
      </div>
    </FormDialog>
  )
}
