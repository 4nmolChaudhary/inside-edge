'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/form/button'
import { useUpdateMatchToss } from '@/api/matches'
import { cn } from '@/lib/utils'
import type { Match, Team } from '@/db/schemas'
import CoinToss from '@/components/scoring/coin-toss'

export const StepToss = ({ arenaId, match, teamA, teamB }: { arenaId: string; match: Match; teamA: Team; teamB: Team }) => {
  const router = useRouter()
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [decision, setDecision] = useState<'bat' | 'bowl' | null>(null)

  const { mutate, isPending } = useUpdateMatchToss({
    onSuccess: () => router.push(`/matches/${match.id}/score?arena=${arenaId}`),
  })

  const winner = winnerId === teamA.id ? teamA : winnerId === teamB.id ? teamB : null
  const battingFirst = winner && decision ? (decision === 'bat' ? winner : winner.id === teamA.id ? teamB : teamA) : null

  const valid = !!winnerId && !!decision

  const submit = () => {
    if (!valid || isPending) return
    mutate({ matchId: match.id, arenaId, tossWinnerId: winnerId!, tossDecision: decision! })
  }

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 pt-2'>
      <CoinToss headsImage='/images/toss-heads.png' tailsImage='/images/toss-tails.png' />
      <div>
        <div className='pb-2 text-lg uppercase text-white/60'>Toss winner</div>
        <div className='grid grid-cols-2 gap-3'>
          {[teamA, teamB].map(team => (
            <button key={team.id} type='button' onClick={() => setWinnerId(team.id)} className={cn('rounded-xl bg-white/5 p-4 text-xl text-white uppercase transition-transform active:scale-[0.98]', winnerId === team.id && 'ring-2 ring-violet')}>
              {team.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className='pb-2 text-lg uppercase text-white/60'>Elected to</div>
        <div className='grid grid-cols-2 gap-3'>
          {(['bat', 'bowl'] as const).map(option => (
            <button key={option} type='button' onClick={() => setDecision(option)} className={cn('rounded-xl bg-white/5 p-4 text-xl text-white uppercase transition-transform active:scale-[0.98]', decision === option && 'ring-2 ring-violet')}>
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className='flex w-full justify-center pt-2'>
        <Button type='button' text='Start Match' loadingText='Starting...' loading={isPending} disabled={!valid} onClick={submit} />
      </div>
    </div>
  )
}

