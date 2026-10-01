'use client'
import { useRef, useState } from 'react'

type Side = 'heads' | 'tails'

type CoinTossProps = {
  headsImage?: string
  tailsImage?: string
  duration?: number
  tossHeight?: number
}

export default function CoinToss({ headsImage, tailsImage, duration = 1400, tossHeight = 100 }: CoinTossProps) {
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<Side | null>(null)
  const [flipping, setFlipping] = useState(false)
  const [stats, setStats] = useState({ heads: 0, tails: 0 })

  const liftRef = useRef<HTMLDivElement>(null)
  const shadowRef = useRef<HTMLDivElement>(null)

  const toss = () => {
    if (flipping) return

    const side: Side = Math.random() < 0.5 ? 'heads' : 'tails'
    const spins = 5 + Math.floor(Math.random() * 3) // 5–7 full turns
    const base = rotation + spins * 360
    const target = base - (base % 360) + (side === 'tails' ? 180 : 0)

    setFlipping(true)
    setResult(null)
    setRotation(target)

    liftRef.current?.animate([{ transform: 'translateY(0)', easing: 'cubic-bezier(0.33, 1, 0.68, 1)' }, { transform: `translateY(-${tossHeight}px)`, offset: 0.5, easing: 'cubic-bezier(0.32, 0, 0.67, 0)' }, { transform: 'translateY(0)' }], { duration })

    shadowRef.current?.animate(
      [
        { transform: 'scale(1)', opacity: 0.6 },
        { transform: 'scale(0.45)', opacity: 0.2, offset: 0.5 },
        { transform: 'scale(1)', opacity: 0.6 },
      ],
      { duration, easing: 'ease-in-out' },
    )

    setTimeout(() => {
      setResult(side)
      setStats(s => ({ ...s, [side]: s[side] + 1 }))
      setFlipping(false)
    }, duration)
  }

  return (
    <div className='flex flex-col items-center justify-center gap-8 text-slate-100'>
      {/* Stage */}
      <div className='relative flex h-75 w-56 items-end justify-center perspective-[1000px]'>
        <div ref={shadowRef} className='absolute bottom-2 h-4 w-28 rounded-full bg-black opacity-60 blur-md' />
        <div ref={liftRef} className='mb-8 transform-3d'>
          <div
            className='relative h-40 w-40 transition-transform ease-[cubic-bezier(0.2,0.7,0.3,1)] transform-3d'
            style={{
              transform: `rotateX(${rotation}deg)`,
              transitionDuration: `${duration}ms`,
            }}>
            <CoinFace side='heads' image={headsImage} />
            <CoinFace side='tails' image={tailsImage} />
          </div>
        </div>
      </div>

      {/* Result */}
      <p className='h-8 text-2xl font-bold tracking-wide'>{flipping ? '…' : result ? result.toUpperCase() : 'Tap to toss'}</p>
      <button type='button' onClick={toss} disabled={flipping} className='w-full rounded-xl bg-white/5 p-4 text-xl text-white uppercase transition-transform disabled:cursor-not-allowed disabled:opacity-50'>
        {flipping ? 'Flipping…' : 'Toss Coin'}
      </button>
    </div>
  )
}

function CoinFace({ side, image }: { side: Side; image?: string }) {
  const isTails = side === 'tails'
  const theme = 'border-amber-600 from-amber-200 via-yellow-500 to-amber-700 text-amber-900 shadow-[inset_0_0_0_8px_rgba(255,255,255,0.25),0_0_20px_rgba(251,191,36,0.35)]'
  return <div className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-full border-4 bg-linear-to-br text-5xl font-black backface-hidden ${theme} ${isTails ? 'transform-[rotateX(180deg)]' : ''}`}>{image ? <img src={image} alt={side} draggable={false} className='h-full w-full select-none rounded-full object-cover' /> : isTails ? 'T' : 'H'}</div>
}
