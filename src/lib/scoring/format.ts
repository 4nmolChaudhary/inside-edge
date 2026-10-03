import type { Ball } from './types'

export type BallKind = 'dot' | 'runs' | 'boundary' | 'wicket' | 'extra'

// Short label shown on a ball chip: 1, 4, W, Wd, Wd+3, Nb+2, Lb1, B2, •
export const ballLabel = (ball: Ball) => {
  const { runs, extra, wicket } = ball
  if (wicket) return extra ? `${extraLabel(ball)}+W` : runs ? `${runs}W` : 'W'
  if (extra) return extraLabel(ball)
  return runs === 0 ? '•' : String(runs)
}

const extraLabel = ({ runs, extra }: Ball) => {
  if (!extra) return ''
  switch (extra.type) {
    case 'w':
      return extra.runs > 1 ? `WD+${extra.runs - 1}` : 'WD'
    case 'n':
      return runs ? `NB+${runs}` : 'NB'
    case 'b':
      return `B${extra.runs}`
    case 'l':
      return `Lb${extra.runs}`
  }
}

export const ballKind = (ball: Ball): BallKind => {
  if (ball.wicket) return 'wicket'
  if (ball.extra) return 'extra'
  if (ball.runs === 4 || ball.runs === 6) return 'boundary'
  return ball.runs === 0 ? 'dot' : 'runs'
}

