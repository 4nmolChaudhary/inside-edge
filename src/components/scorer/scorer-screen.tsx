'use client'
import { useMemo, useState } from 'react'

import { useAbandonMatch, useCompleteMatch, useEndInnings, useRecordBall, useStartSuperOver, useUndoBall } from '@/api/scoring'
import { ActionBar } from '@/components/scorer/action-bar'
import { CompleteMatchDialog } from '@/components/scorer/complete-match-dialog'
import { ConfirmDialog } from '@/components/scorer/confirm-dialog'
import { InningsStartDialog } from '@/components/scorer/innings-start-dialog'
import { MatchBoard } from '@/components/scorer/match-board'
import { MatchDetails } from '@/components/scorer/match-details'
import { buildMatchView, matchPlayers, potmMatchOf } from '@/components/scorer/match-view'
import { NewBatterDialog } from '@/components/scorer/new-batter-dialog'
import { toOptions } from '@/components/scorer/player-choice'
import { PlayerPickerDialog } from '@/components/scorer/player-picker-dialog'
import { PotmCard } from '@/components/scorer/potm-card'
import { RetireDialog, type RetireChoice } from '@/components/scorer/retire-dialog'
import { RunPad } from '@/components/scorer/run-pad'
import { panelClass } from '@/components/scorer/styles'
import { WicketSheet, type WicketDraft } from '@/components/scorer/wicket-sheet'
import { TieDialog } from '@/components/scorer/tie-dialog'
import { toast } from '@/components/ui/toast'
import { formatOvers } from '@/lib/cricket'
import { computeResult, computeSuperOverResult, encodeBall, encodeRetire, suggestPlayerOfMatch } from '@/lib/scoring'
import type { Ball, ExtraType, MatchSnapshot, ScorerMatch } from '@/lib/scoring'
import { cn } from '@/lib/utils'

type Pending = { striker?: number; nonStriker?: number; bowler?: number }
type SaveState = 'idle' | 'saved' | 'error'
type UserDialog = 'wicket' | 'bowler' | 'retire' | 'undo' | 'endInnings' | 'abandon' | null

const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
}

const SaveStatus = ({ busy, state }: { busy: boolean; state: SaveState }) => (
  <div className={cn('text-center text-sm uppercase font-(family-name:--font-inter-tight)', busy ? 'text-yellow' : state === 'error' ? 'text-sporty-red' : 'text-white/40')}>{busy ? 'Saving...' : state === 'saved' ? 'Saved' : state === 'error' ? 'Not saved - try again' : 'Ready'}</div>
)

export const ScorerScreen = ({ arenaId, match }: { arenaId: string; match: ScorerMatch }) => {
  const [snapshot, setSnapshot] = useState<MatchSnapshot>(match.snapshot)
  const [pending, setPending] = useState<Pending>({}) // selections made before the next ball carries them
  const [extra, setExtra] = useState<ExtraType | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [dialog, setDialog] = useState<UserDialog>(null)
  const [dismissedPrompt, setDismissedPrompt] = useState<string | null>(null)

  const view = useMemo(() => buildMatchView(match, snapshot), [match, snapshot])
  const { state, tokens, innings, battingTeam, bowlingTeam, battingFirst, bowlingFirst } = view

  const handlers = {
    onSnapshot: (next: MatchSnapshot) => {
      setSnapshot(next)
      setPending({})
      setExtra(null)
    },
    onSettled: (ok: boolean) => setSaveState(ok ? 'saved' : 'error'),
  }
  const record = useRecordBall(handlers)
  const undo = useUndoBall(handlers)
  const end = useEndInnings(handlers)
  const startSuper = useStartSuperOver(handlers)
  const complete = useCompleteMatch(handlers)
  const abandon = useAbandonMatch(handlers)
  const busy = record.isPending || undo.isPending || end.isPending || startSuper.isPending || complete.isPending || abandon.isPending

  const live = snapshot.status === 'live'
  const inningsDone = state.complete.done
  // the match innings ended level: offer a super over (or ending as a tie)
  const tied = innings === 2 && inningsDone && view.inn1.totals.runs === view.inn2.totals.runs
  const striker = pending.striker ?? state.striker
  const nonStriker = pending.nonStriker ?? state.nonStriker
  const bowler = pending.bowler ?? state.bowler

  const promptKey = `${innings}:${tokens.length}`
  const blocking = !live
    ? null
    : inningsDone
      ? dismissedPrompt === promptKey
        ? null
        : tied
          ? 'tie'
          : 'complete'
      : state.needsOpeners && (pending.striker === undefined || pending.bowler === undefined)
        ? 'openers'
        : state.needsNewBatter && (striker === null || nonStriker === null)
          ? 'batter'
          : state.needsNewBowler && pending.bowler === undefined
            ? 'bowler'
            : null

  const canScore = live && !inningsDone && !blocking && striker !== null && nonStriker !== null && bowler !== null
  const lastMan = state.lastManStanding
  const solo = striker !== null && striker === nonStriker // forced (last man standing) or chosen while a retired batter could return
  const canRetire = canScore && !busy && tokens.length > 0 && !solo && !state.needsNewBatter

  const compose = (runs: number, wicket?: Ball['wicket']): Ball => {
    const base = { striker: striker!, nonStriker: nonStriker!, bowler: bowler! }
    if (extra === 'w') return { ...base, runs: 0, extra: { type: 'w', runs: 1 + runs }, wicket }
    if (extra === 'n') return { ...base, runs, extra: { type: 'n', runs: 1 }, wicket }
    // byes need at least one run; a dot with a run out is just a dot
    if ((extra === 'b' || extra === 'l') && runs > 0) return { ...base, runs: 0, extra: { type: extra, runs }, wicket }
    return { ...base, runs, wicket }
  }

  const submit = (runs: number, wicket?: Ball['wicket']) => {
    if (!canScore || busy) return
    try {
      const token = encodeBall(compose(runs, wicket))
      vibrate(wicket ? [40, 30, 40] : 25)
      record.mutate({ matchId: match.id, arenaId, token, expectedLength: tokens.length })
    } catch (error) {
      toast.add({ type: 'error', title: error instanceof Error ? error.message : 'Could not record ball', timeout: 5000, priority: 'high' })
    }
  }

  const confirmWicket = (draft: WicketDraft) => {
    setDialog(null)
    submit(draft.type === 'r' ? draft.runs : 0, { type: draft.type, out: draft.out, ...(draft.fielder !== undefined && { fielder: draft.fielder }) })
  }

  const swapStrike = () => {
    if (striker === null || nonStriker === null || lastMan) return
    setPending(current => ({ ...current, striker: nonStriker, nonStriker: striker }))
  }

  const confirmRetire = ({ end: retiringEnd, out }: RetireChoice) => {
    setDialog(null)
    const batter = retiringEnd === 'striker' ? striker : nonStriker
    if (batter === null || busy) return
    vibrate(out ? [40, 30, 40] : 25)
    record.mutate({ matchId: match.id, arenaId, token: encodeRetire({ batter, out }), expectedLength: tokens.length })
  }

  const finishInnings = () => {
    setDialog(null)
    setDismissedPrompt(null)
    if (innings === 1 || innings === 3) end.mutate({ matchId: match.id, arenaId })
    else complete.mutate({ matchId: match.id, arenaId })
  }

  const preview = useMemo(() => {
    const { inn1, inn2, super1, super2 } = view
    const regular = computeResult({
      battingFirstId: battingFirst.id,
      teamA: { id: battingFirst.id, name: battingFirst.name, runs: inn1.totals.runs, wickets: inn1.totals.wickets, squadSize: battingFirst.squad.length },
      teamB: { id: bowlingFirst.id, name: bowlingFirst.name, runs: inn2.totals.runs, wickets: inn2.totals.wickets, squadSize: bowlingFirst.squad.length },
    })
    // in the super over the first side to bat is the one that batted second in the match
    const result =
      view.innings === 4
        ? computeSuperOverResult({
            first: { id: bowlingFirst.id, name: bowlingFirst.name, runs: super1.totals.runs, wickets: super1.totals.wickets },
            second: { id: battingFirst.id, name: battingFirst.name, runs: super2.totals.runs, wickets: super2.totals.wickets },
          })
        : regular
    return { ...result, potmRanking: suggestPlayerOfMatch(potmMatchOf(view, result.winnerId), inn1, inn2) }
  }, [view, battingFirst, bowlingFirst])
  const resultPreview = preview.resultText
  const players = useMemo(() => matchPlayers(view), [view])
  const eligibleBatters = [...state.availableBatters, ...state.retiredBatters]

  const completeReason = state.complete.reason === 'target' ? 'Target chased' : state.complete.reason === 'allOut' ? 'All out' : 'All overs bowled'
  // each bowler may bowl at most ceil(overs / squad size) overs; a started over counts as bowled
  const bowlerQuota = Math.ceil(view.inningsOvers /Math.max(bowlingTeam.squad.length, 1))
  const oversLeft = (index: number) => {
    const balls = state.bowlers.find(stat => stat.index === index)?.balls ?? 0
    return Math.max(bowlerQuota - Math.ceil(balls / 6), 0)
  }
  const bowlerOptions = toOptions(bowlingTeam.squad)
    .filter(option => !(state.needsNewBowler && state.previousOverBowler === option.index)) // no back-to-back overs
    .map(option => {
      const left = oversLeft(option.index)
      return { ...option, hint: `${left} ${left === 1 ? 'over' : 'overs'} left` }
    })
  const exhaustedBowlers = bowlerOptions.filter(option => oversLeft(option.index) === 0).map(option => option.index)

  return (
    <div className='flex flex-1 flex-col gap-4 overflow-auto p-4 pt-0'>
      <MatchBoard view={view} striker={striker} nonStriker={nonStriker} bowler={bowler} />

      {!live && (
        <div className={cn(panelClass, 'text-center text-2xl uppercase text-lime')}>{snapshot.resultText ?? (snapshot.status === 'abandoned' ? 'Match abandoned' : 'Match complete')}</div>
      )}
      {snapshot.status === 'completed' && <PotmCard view={view} playerOfMatchId={snapshot.playerOfMatchId} />}

      {live && (
        <>
          <RunPad disabled={!canScore || busy} extra={extra} onExtraChange={setExtra} onRuns={submit} onWicket={() => setDialog('wicket')} />
          <SaveStatus busy={busy} state={saveState} />
          <ActionBar
            busy={busy}
            canUndo={tokens.length > 0}
            canSwap={striker !== null && nonStriker !== null && !solo}
            canRetire={canRetire}
            onRetire={() => setDialog('retire')}
            inningsLabel={innings === 1 || innings === 3 ? 'End innings' : 'End match'}
            onUndo={() => setDialog('undo')}
            onSwap={swapStrike}
            onEndInnings={() => setDialog('endInnings')}
          />
        </>
      )}

      <MatchDetails view={view} />

      {live && (
        <>
          {/* blocking selections */}
          <InningsStartDialog
            key={`start-${innings}`}
            open={blocking === 'openers'}
            battingSquad={battingTeam.squad}
            bowlingSquad={bowlingTeam.squad}
            battingName={battingTeam.name}
            superOver={view.isSuper}
            summary={
              innings === 2
                ? { teamName: battingFirst.name, score: `${view.inn1.totals.runs}/${view.inn1.totals.wickets}`, overs: formatOvers(view.inn1.totals.balls), target: view.target ?? 0, chasingName: bowlingFirst.name }
                : innings === 4
                  ? { teamName: bowlingFirst.name, score: `${view.super1.totals.runs}/${view.super1.totals.wickets}`, overs: formatOvers(view.super1.totals.balls), target: view.target ?? 0, chasingName: battingFirst.name }
                  : undefined
            }
            onConfirm={selection => setPending(selection)}
          />
          <NewBatterDialog
            key={`batter-${innings}-${tokens.length}`}
            open={blocking === 'batter'}
            squad={battingTeam.squad}
            available={state.availableBatters.filter(index => index !== pending.striker)}
            retired={state.retiredBatters.filter(index => index !== pending.striker)}
            batters={state.batters}
            vacated={state.needsNewBatter?.vacated ?? 'striker'}
            runOut={!!state.needsNewBatter?.runOut}
            vacancies={state.needsNewBatter?.vacancies ?? 1}
            canGoSolo={state.soloAllowed && !state.lastManStanding && state.availableBatters.length === 0 && state.needsNewBatter?.vacancies === 1}
            onSolo={() => {
              const staying = state.striker ?? state.nonStriker
              if (staying !== null) setPending(current => ({ ...current, striker: staying, nonStriker: staying }))
            }}
            onSelect={(index, endSelected) => {
              // the crease is empty: two batters come in one after the other (a single eligible batter bats alone)
              if (state.needsNewBatter?.vacancies === 2) {
                setPending(current => (current.striker === undefined ? { ...current, striker: index, ...(eligibleBatters.length === 1 && { nonStriker: index }) } : { ...current, nonStriker: index }))
                return
              }
              const staying = state.striker ?? state.nonStriker
              setPending(current => ({ ...current, striker: endSelected === 'striker' ? index : (staying ?? undefined), nonStriker: endSelected === 'nonStriker' ? index : (staying ?? undefined) }))
            }}
          />
          <PlayerPickerDialog
            open={blocking === 'bowler'}
            title='Next bowler'
            description='Over complete. Who bowls next?'
            options={bowlerOptions}
            disabled={exhaustedBowlers}
            onSelect={index => setPending(current => ({ ...current, bowler: index }))}
          />
          <TieDialog
            open={blocking === 'tie'}
            onOpenChange={() => setDismissedPrompt(promptKey)}
            description={`${completeReason}. Scores are level on ${view.inn1.totals.runs}. Play a one-over super over to decide it?`}
            busy={busy}
            onSuperOver={() => startSuper.mutate({ matchId: match.id, arenaId })}
            onCompleteAsTie={finishInnings}
          />
          {innings === 1 || innings === 3 ? (
            <ConfirmDialog
              open={blocking === 'complete'}
              onOpenChange={() => setDismissedPrompt(promptKey)}
              title='Innings complete'
              description={`${completeReason}. End the innings and start the chase?`}
              confirmText='End innings'
              cancelText='Review'
              onConfirm={finishInnings}
            />
          ) : (
            <CompleteMatchDialog
              key={`complete-${tokens.length}`}
              open={blocking === 'complete'}
              onOpenChange={() => setDismissedPrompt(promptKey)}
              title='Match complete'
              description={`${completeReason}. ${resultPreview}.`}
              confirmText='Complete match'
              ranking={preview.potmRanking}
              players={players}
              onConfirm={finishInnings}
            />
          )}

          {/* scorer-triggered dialogs */}
          <WicketSheet
            open={dialog === 'wicket' && !blocking}
            onOpenChange={open => !open && setDialog(null)}
            extra={extra}
            lastManStanding={solo}
            strikerName={striker === null ? 'Striker' : (battingTeam.squad[striker]?.name ?? 'Striker')}
            nonStrikerName={nonStriker === null ? 'Non-striker' : (battingTeam.squad[nonStriker]?.name ?? 'Non-striker')}
            bowlingSquad={bowlingTeam.squad}
            bowlerIndex={bowler}
            onConfirm={confirmWicket}
          />
          <PlayerPickerDialog
            open={dialog === 'bowler' && !blocking}
            title='Change bowler'
            description='Replace the bowler for the rest of this over'
            options={bowlerOptions}
            disabled={exhaustedBowlers}
            selected={bowler}
            onOpenChange={open => !open && setDialog(null)}
            onSelect={index => {
              setPending(current => ({ ...current, bowler: index }))
              setDialog(null)
            }}
          />
          <ConfirmDialog
            open={dialog === 'undo' && !blocking}
            onOpenChange={open => !open && setDialog(null)}
            title='Undo last ball?'
            description='The last delivery is removed and the score is recalculated.'
            confirmText='Undo'
            onConfirm={() => {
              setDialog(null)
              undo.mutate({ matchId: match.id, arenaId, expectedLength: tokens.length })
            }}
          />
          {innings === 1 || innings === 3 ? (
            <ConfirmDialog
              open={dialog === 'endInnings' && !blocking}
              onOpenChange={open => !open && setDialog(null)}
              title='End innings?'
              description='The innings ends now, even if overs remain.'
              confirmText='End innings'
              onConfirm={finishInnings}
            />
          ) : (
            <CompleteMatchDialog
              key={`end-${tokens.length}`}
              open={dialog === 'endInnings' && !blocking}
              onOpenChange={open => !open && setDialog(null)}
              title='End match?'
              description={`The match ends now. ${resultPreview}.`}
              confirmText='End match'
              cancelText='Cancel'
              ranking={preview.potmRanking}
              players={players}
              onConfirm={finishInnings}
            />
          )}
          <RetireDialog
            open={dialog === 'retire' && !blocking}
            onOpenChange={open => !open && setDialog(null)}
            strikerName={striker === null ? 'Striker' : (battingTeam.squad[striker]?.name ?? 'Striker')}
            nonStrikerName={nonStriker === null ? 'Non-striker' : (battingTeam.squad[nonStriker]?.name ?? 'Non-striker')}
            onConfirm={confirmRetire}
          />
          <ConfirmDialog
            open={dialog === 'abandon' && !blocking}
            onOpenChange={open => !open && setDialog(null)}
            title='Abandon match?'
            description='No result and no player stats will be recorded.'
            confirmText='Abandon'
            destructive
            onConfirm={() => {
              setDialog(null)
              abandon.mutate({ matchId: match.id, arenaId })
            }}
          />
        </>
      )}
    </div>
  )
}
