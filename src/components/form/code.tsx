'use client'
import { useRef } from 'react'

type CodeProps = {
  value: string[]
  setValue: React.Dispatch<React.SetStateAction<string[]>>
}

export const Code = ({ value, setValue }: CodeProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const length = value.length

  const setAt = (index: number, digit: string) => {
    setValue(prev => {
      const next = [...prev]
      next[index] = digit
      return next
    })
  }

  const onChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1)
    setAt(index, digit)
    if (digit && index < length - 1) refs.current[index + 1]?.focus()
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      setAt(index - 1, '')
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    else if (e.key === 'ArrowRight' && index < length - 1) refs.current[index + 1]?.focus()
  }

  return (
    <div className='flex justify-center gap-2 sm:gap-3'>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => {
            refs.current[i] = el
          }}
          value={digit}
          onChange={e => onChange(i, e.target.value)}
          onKeyDown={e => onKeyDown(i, e)}
          onFocus={e => e.target.select()}
          inputMode='numeric'
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={i === 0}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className='h-16 w-12 sm:h-20 sm:w-14 rounded-xl bg-white text-black text-center text-5xl outline-none focus:ring-4 focus:ring-black'
        />
      ))}
    </div>
  )
}
