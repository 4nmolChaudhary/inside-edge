'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { StepTeams } from '@/components/scoring/step-teams'
import { StepSquads } from '@/components/scoring/step-squads'
import { StepToss } from '@/components/scoring/step-toss'
import type { Match, Player, Team } from '@/db/schemas'

const MIN_SQUAD_SIZE = 2

const STEP_TITLES = { 1: 'Select Teams', 2: 'Add Players', 3: 'Toss' } as const

type SetupWizardProps = {
  arenaId: string
  teams: Team[]
  players: Player[]
  match?: Match | null
}

export const SetupWizard = ({ arenaId, teams, players, match }: SetupWizardProps) => {
  const step = !match ? 1 : match.teamAPlayerIds.length < MIN_SQUAD_SIZE || match.teamBPlayerIds.length < MIN_SQUAD_SIZE ? 2 : 3

  const teamAObj = match ? teams.find(team => team.id === match.teamAId) : undefined
  const teamBObj = match ? teams.find(team => team.id === match.teamBId) : undefined

  return (
    <>
      <div className='flex items-center gap-3 p-4 pb-1'>
        <Link href={`/home?arena=${arenaId}`} aria-label='Back' className='flex size-10 items-center justify-center rounded-xl bg-violet text-white transition-transform active:scale-[0.98]'>
          <ArrowLeft size={22} />
        </Link>
        <div className='flex flex-col'>
          <span className='text-5xl leading-none text-white uppercase'>{STEP_TITLES[step]}</span>
        </div>
      </div>
      {step === 1 && <StepTeams arenaId={arenaId} teams={teams} />}
      {step === 2 && match && <StepSquads arenaId={arenaId} match={match} players={players} />}
      {step === 3 && match && teamAObj && teamBObj && <StepToss arenaId={arenaId} match={match} teamA={teamAObj} teamB={teamBObj} />}
    </>
  )
}

