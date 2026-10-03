import { ChevronDown } from 'lucide-react'

import { FallOfWickets } from '@/components/scorer/fall-of-wickets'
import type { MatchView } from '@/components/scorer/match-view'
import { OverHistory } from '@/components/scorer/over-history'
import { InningsScorecard } from '@/components/scorer/scorecard'
import { panelClass } from '@/components/scorer/styles'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <details className={`${panelClass} group`}>
    <summary className='flex cursor-pointer list-none items-center justify-between text-2xl uppercase text-white [&::-webkit-details-marker]:hidden'>
      {title}
      <ChevronDown size={22} className='transition-transform group-open:rotate-180' />
    </summary>
    <div className='flex flex-col gap-6 pt-4'>{children}</div>
  </details>
)

// Collapsible scorecard / over history / fall of wickets, for both innings that have started.
export const MatchDetails = ({ view }: { view: MatchView }) => {
  const { battingFirst, bowlingFirst, inn1, inn2, super1, super2, innings } = view
  const secondStarted = innings >= 2
  const super1Started = innings >= 3 // the side that batted second bats first in the super over
  const super2Started = innings === 4

  return (
    <>
      <Section title='Scorecard'>
        <InningsScorecard title={`${battingFirst.name} innings`} state={inn1} battingSquad={battingFirst.squad} bowlingSquad={bowlingFirst.squad} />
        {secondStarted && <InningsScorecard title={`${bowlingFirst.name} innings`} state={inn2} battingSquad={bowlingFirst.squad} bowlingSquad={battingFirst.squad} />}
        {super1Started && <InningsScorecard title={`${bowlingFirst.name} super over`} state={super1} battingSquad={bowlingFirst.squad} bowlingSquad={battingFirst.squad} />}
        {super2Started && <InningsScorecard title={`${battingFirst.name} super over`} state={super2} battingSquad={battingFirst.squad} bowlingSquad={bowlingFirst.squad} />}
      </Section>
      <Section title='Overs'>
        <OverHistory title={battingFirst.name} state={inn1} bowlingSquad={bowlingFirst.squad} />
        {secondStarted && <OverHistory title={bowlingFirst.name} state={inn2} bowlingSquad={battingFirst.squad} />}
        {super1Started && <OverHistory title={`${bowlingFirst.name} super over`} state={super1} bowlingSquad={battingFirst.squad} />}
        {super2Started && <OverHistory title={`${battingFirst.name} super over`} state={super2} bowlingSquad={bowlingFirst.squad} />}
      </Section>
      <Section title='Fall of wickets'>
        <FallOfWickets title={battingFirst.name} state={inn1} battingSquad={battingFirst.squad} />
        {secondStarted && <FallOfWickets title={bowlingFirst.name} state={inn2} battingSquad={bowlingFirst.squad} />}
        {super1Started && <FallOfWickets title={`${bowlingFirst.name} super over`} state={super1} battingSquad={bowlingFirst.squad} />}
        {super2Started && <FallOfWickets title={`${battingFirst.name} super over`} state={super2} battingSquad={battingFirst.squad} />}
      </Section>
    </>
  )
}
