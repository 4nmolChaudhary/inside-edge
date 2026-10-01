'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { Tabs } from 'radix-ui'

import { Button } from '@/components/form/button'
import { useUpdateMatchSquads } from '@/api/matches'
import { cn } from '@/lib/utils'
import type { Match, Player } from '@/db/schemas'

const MIN_SQUAD_SIZE = 2

type Squad = { playerIds: string[]; captainId: string | null }

const toggleSquad = (squad: Squad, playerId: string): Squad => {
  const inSquad = squad.playerIds.includes(playerId)
  const playerIds = inSquad ? squad.playerIds.filter(id => id !== playerId) : [...squad.playerIds, playerId]
  const captainId = inSquad && squad.captainId === playerId ? null : squad.captainId
  return { playerIds, captainId }
}

export const StepSquads = ({ arenaId, match, players }: { arenaId: string; match: Match; players: Player[] }) => {
  const router = useRouter()
  const [teamA, setTeamA] = useState<Squad>({ playerIds: match.teamAPlayerIds, captainId: match.teamACaptainId })
  const [teamB, setTeamB] = useState<Squad>({ playerIds: match.teamBPlayerIds, captainId: match.teamBCaptainId })

  const { mutate, isPending } = useUpdateMatchSquads({ onSuccess: () => router.refresh() })

  const valid = teamA.playerIds.length >= MIN_SQUAD_SIZE && teamB.playerIds.length >= MIN_SQUAD_SIZE

  const submit = () => {
    if (!valid || isPending) return
    mutate({
      matchId: match.id,
      arenaId,
      teamAPlayerIds: teamA.playerIds,
      teamBPlayerIds: teamB.playerIds,
      teamACaptainId: teamA.captainId,
      teamBCaptainId: teamB.captainId,
    })
  }

  const renderTeam = (squad: Squad, otherSquad: Squad, onToggle: (id: string) => void, onCaptain: (id: string) => void) => (
    <div className='flex flex-col gap-2 p-4 pt-2'>
      {players.map(player => {
        const selected = squad.playerIds.includes(player.id)
        const disabled = otherSquad.playerIds.includes(player.id)
        return (
          <div key={player.id} className={cn('flex items-center justify-between rounded-xl bg-white/5 p-3', disabled && 'opacity-30')}>
            <button type='button' disabled={disabled} onClick={() => onToggle(player.id)} className={cn('flex-1 text-left text-xl uppercase', selected ? 'text-lime' : 'text-white')}>
              {player.firstName} {player.lastName}
            </button>
            {selected && (
              <button type='button' onClick={() => onCaptain(player.id)} aria-label='Mark captain'>
                <Star size={20} className={squad.captainId === player.id ? 'fill-yellow text-yellow' : 'text-white/40'} />
              </button>
            )}
          </div>
        )
      })}
      {!players.length && <div className='p-4 text-center text-xl uppercase text-white/60'>No players yet</div>}
    </div>
  )

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <Tabs.Root defaultValue='a' className='flex flex-1 flex-col overflow-hidden'>
        <Tabs.List className='flex gap-2 px-4 pb-2'>
          <Tabs.Trigger value='a' className='flex-1 rounded-xl bg-white/5 py-2 text-lg text-white uppercase data-[state=active]:bg-violet'>
            Team A ({teamA.playerIds.length})
          </Tabs.Trigger>
          <Tabs.Trigger value='b' className='flex-1 rounded-xl bg-white/5 py-2 text-lg text-white uppercase data-[state=active]:bg-violet'>
            Team B ({teamB.playerIds.length})
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='a' className='flex-1 overflow-auto'>
          {renderTeam(
            teamA,
            teamB,
            id => setTeamA(prev => toggleSquad(prev, id)),
            id => setTeamA(prev => ({ ...prev, captainId: prev.captainId === id ? null : id })),
          )}
        </Tabs.Content>
        <Tabs.Content value='b' className='flex-1 overflow-auto'>
          {renderTeam(
            teamB,
            teamA,
            id => setTeamB(prev => toggleSquad(prev, id)),
            id => setTeamB(prev => ({ ...prev, captainId: prev.captainId === id ? null : id })),
          )}
        </Tabs.Content>
      </Tabs.Root>
      <div className='flex w-full justify-center p-4'>
        <Button type='button' text='Next' loadingText='Saving...' loading={isPending} disabled={!valid} onClick={submit} />
      </div>
    </div>
  )
}

