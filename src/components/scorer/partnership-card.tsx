import { captionClass, panelClass } from '@/components/scorer/styles'

export const PartnershipCard = ({ runs, balls }: { runs: number; balls: number }) => (
  <div className={`${panelClass} flex items-center justify-between`}>
    <span className={captionClass}>Partnership</span>
    <span className='text-2xl text-white'>
      {runs} <span className='text-base text-white/50'>({balls})</span>
    </span>
  </div>
)
