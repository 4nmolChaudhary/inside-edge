'use client'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/form/button'

import { useCreateMatch } from '@/api/matches'
import { cn } from '@/lib/utils'
import type { Team } from '@/db/schemas'

import { TEAM_COLORS, TEAM_IMAGES } from '@/constants/images'

const OVERS_OPTIONS = ['6', '8', '10', '12', '14']
const DEFAULT_OVERS = OVERS_OPTIONS[0]

export const StepTeams = ({ arenaId, teams }: { arenaId: string; teams: Team[] }) => {
  const router = useRouter()
  const [teamAId, setTeamAId] = useState<string | null>(null)
  const [teamBId, setTeamBId] = useState<string | null>(null)
  const [overs, setOvers] = useState(DEFAULT_OVERS)

  const { mutate, isPending } = useCreateMatch({
    onSuccess: match => router.push(`/scoring/${match.id}?arena=${arenaId}`),
  })

  const oversValue = Number(overs)
  const valid = !!teamAId && !!teamBId && teamAId !== teamBId
  const submit = () => {
    if (!valid || isPending) return
    mutate({ arenaId, teamAId: teamAId!, teamBId: teamBId!, overs: oversValue })
  }

  if (!teams.length) return <div className='flex flex-1 items-center justify-center p-4 text-center text-2xl uppercase text-white/60'>Add at least two teams first</div>

  const renderList = (side: 'a' | 'b', selectedId: string | null, otherId: string | null) => (
    <div className='grid grid-cols-3 content-start gap-3'>
      {teams.map(team => {
        const logo = team.logoUrl ?? ''
        const color = TEAM_COLORS[logo] ?? '#7c4dff'
        const image = TEAM_IMAGES[logo]
        const disabled = otherId === team.id
        const selected = selectedId === team.id
        return (
          <button key={team.id} type='button' disabled={disabled} onClick={() => (side === 'a' ? setTeamAId(prev => (prev === team.id ? null : team.id)) : setTeamBId(prev => (prev === team.id ? null : team.id)))} className={cn('rounded-xl bg-white/5 p-3 flex flex-col justify-center items-center transition-transform active:scale-[0.98]', selected && 'ring-2 ring-violet', disabled && 'cursor-not-allowed opacity-30 active:scale-100')}>
            {image && <Image src={image} alt='' className='w-24' />}
            <div className='text-2xl uppercase' style={{ color }}>
              {team.name}
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-auto p-4 pt-2'>
      <div>
        <div className='pb-2 text-lg uppercase text-white/60'>Team A</div>
        {renderList('a', teamAId, teamBId)}
      </div>
      <div>
        <div className='pb-2 text-lg uppercase text-white/60'>Team B</div>
        {renderList('b', teamBId, teamAId)}
      </div>
      <div>
        <div className='pb-2 text-lg uppercase text-white/60'>Overs</div>
        <div className='flex gap-2'>
          {OVERS_OPTIONS.map(option => (
            <button key={option} type='button' onClick={() => setOvers(option)} className={cn('flex-1 rounded-xl bg-white/5 text-white py-3 text-2xl transition-transform active:scale-[0.98]', overs === option && 'ring-2 ring-violet bg-white/10')}>
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className='flex w-full justify-center pt-2 pb-4'>
        <Button type='button' text='Next' loadingText='Creating...' loading={isPending} disabled={!valid} onClick={submit} />
      </div>
    </div>
  )
}

