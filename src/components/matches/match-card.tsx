import Link from 'next/link'

import { TeamLogo } from '@/components/matches/team-badge'
import type { getLiveMatchesByArena } from '@/db/queries/matches'
import { TEAM_COLORS } from '@/constants/images'
import { formatMatchDateTime, formatOvers } from '@/lib/cricket'
import { cn } from '@/lib/utils'

export type MatchRow = Awaited<ReturnType<typeof getLiveMatchesByArena>>[number]

const TeamColumn = ({ team, overs, score, reverse = false }: { team: MatchRow['teamA']; overs?: string; score?: string; reverse?: boolean }) => (
  <div className={cn('flex justify-between w-1/2', reverse ? 'flex-row-reverse' : '')}>
    <TeamLogo logoUrl={team.logoUrl} size='w-24' className='overflow-hidden h-18' />
    <div className={cn('flex flex-col', reverse ? 'items-start' : 'items-end')}>
      {overs && <span className='text-xs tracking-tight font-(family-name:--font-inter-tight) text-white/50'>{overs} Overs</span>}
      {score && <span className='text-4xl tracking-wide font-bold text-cyan'>{score}</span>}
      <span className='text -mt-2 text-white uppercase'>{team.name}</span>
    </div>
  </div>
)

const battingTeamOf = (match: MatchRow) => {
  if (!match.battingFirstId) return null
  const battingFirst = match.battingFirstId === match.teamA.id ? match.teamA : match.teamB
  const bowlingFirst = battingFirst.id === match.teamA.id ? match.teamB : match.teamA
  // innings 1 and 4 (super over chase) are batted by the side that won the toss to bat
  return match.currentInnings === 1 || match.currentInnings === 4 ? battingFirst : bowlingFirst
}

export const MatchCard = ({ match, arenaId, isAuthenticated }: { match: MatchRow; arenaId: string; isAuthenticated: boolean }) => {
  const isSetup = match.status === 'setup'
  const isLive = match.status === 'live'
  const isCompleted = match.status === 'completed'

  // Authorized users score a live match; everyone else just watches it ball by ball.
  const liveHref = isAuthenticated ? `/matches/${match.id}/score?arena=${arenaId}` : `/matches/${match.id}/live?arena=${arenaId}`
  const href = isSetup ? `/scoring/${match.id}?arena=${arenaId}` : isLive ? liveHref : `/matches/${match.id}?arena=${arenaId}`
  const dateTime = formatMatchDateTime(isLive ? (match.startedAt ?? match.createdAt) : isSetup ? match.createdAt : (match.completedAt ?? match.createdAt))

  const battingTeam = isLive ? battingTeamOf(match) : null
  const highlight = isLive ? (battingTeam ? `${battingTeam.name} batting${match.currentInnings >= 3 ? ' (super over)' : ''}` : null) : match.resultText
  const winner = match.winnerId === match.teamA.id ? match.teamA : match.winnerId === match.teamB.id ? match.teamB : null
  const winnerColor = winner?.logoUrl ? TEAM_COLORS[winner.logoUrl] : undefined
  const highlightClassName = isLive ? 'text-lime' : winnerColor ? undefined : 'text-yellow'
  const highlightStyle = !isLive && winnerColor ? { color: winnerColor } : undefined

  const scoreA = isSetup ? undefined : `${match.teamARuns}/${match.teamAWickets}`
  const scoreB = isSetup ? undefined : `${match.teamBRuns}/${match.teamBWickets}`
  const oversA = isSetup ? undefined : formatOvers(match.teamABalls)
  const oversB = isSetup ? undefined : formatOvers(match.teamBBalls)

  return (
    <Link href={href} className='flex flex-col gap-3 overflow-hidden rounded-xl border-2 border-violet bg-card p-4 min-h-55 hide-scrollbar'>
      <div className='flex justify-between'>
        <div className='text-xs tracking-tight font-(family-name:--font-inter-tight) text-white/50 uppercase'>{dateTime}</div>
        {isLive && <span className='text-center font-(family-name:--font-inter-tight) text-xs bg-sporty-red uppercase px-3 py-0.5 rounded text-white font-semibold'>•{'  '}Live</span>}
        {isCompleted && <span className='text-center font-(family-name:--font-inter-tight) text-xs bg-green uppercase px-3 py-0.5 rounded text-black font-semibold'>Completed</span>}
      </div>
      <div className='flex gap-4'>
        <TeamColumn team={match.teamA} overs={oversA} score={scoreA} />
        <div className='w-px bg-white/15' />
        <TeamColumn team={match.teamB} overs={oversB} score={scoreB} reverse />
      </div>
      {highlight && (
        <div className={cn('text-center font-semibold text-sm uppercase font-(family-name:--font-inter-tight)', highlightClassName)} style={highlightStyle}>
          {highlight}
        </div>
      )}
      <div className='flex gap-2 bg-violet px-4 pt-2 py-1 text-white rounded-sm justify-center items-center'>
        <span className='text-lg'>MATCH CENTER</span>
      </div>
    </Link>
  )
}

