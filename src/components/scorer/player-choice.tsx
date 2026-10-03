import { cn } from '@/lib/utils'
import type { SquadPlayer } from '@/lib/scoring'
import { choiceClass, choiceSelectedClass } from '@/components/scorer/styles'

export type PlayerOption = { index: number; label: string; hint?: string }

export const toOptions = (squad: SquadPlayer[], indexes?: number[]): PlayerOption[] =>
  (indexes ?? squad.map((_, index) => index)).filter(index => squad[index]).map(index => ({ index, label: squad[index].name, hint: squad[index].number !== null ? `#${squad[index].number}` : undefined }))

type PlayerChoiceProps = {
  options: PlayerOption[]
  selected?: number | null
  disabled?: number[]
  onSelect: (index: number) => void
}

export const PlayerChoice = ({ options, selected = null, disabled = [], onSelect }: PlayerChoiceProps) => (
  <div className='grid grid-cols-2 gap-2'>
    {options.map(option => (
      <button key={option.index} type='button' disabled={disabled.includes(option.index)} onClick={() => onSelect(option.index)} className={cn(choiceClass, 'flex flex-col leading-tight', selected === option.index && choiceSelectedClass)}>
        <span className='truncate'>{option.label}</span>
        {option.hint && <span className='text-xs text-white/60 font-(family-name:--font-inter-tight)'>{option.hint}</span>}
      </button>
    ))}
  </div>
)
