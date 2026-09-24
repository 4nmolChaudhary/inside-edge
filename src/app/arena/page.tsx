'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'

import { Button } from '@/components/form/button'
import Character from '@/assets/images/character-1.png'
import { verifyArenaCode } from '@/db/queries/arenas'

const LENGTH = 6

export default function Arena() {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')
  const complete = code.length === LENGTH

  const setAt = (index: number, value: string) => {
    setDigits(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const onChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '').slice(-1)
    setAt(index, value)
    if (value && index < LENGTH - 1) refs.current[index + 1]?.focus()
  }

  const onKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      setAt(index - 1, '')
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus()
    else if (e.key === 'ArrowRight' && index < LENGTH - 1) refs.current[index + 1]?.focus()
    else if (e.key === 'Enter' && complete) submit()
  }

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH)
    if (!pasted) return
    setDigits(Array.from({ length: LENGTH }, (_, i) => pasted[i] ?? ''))
    refs.current[Math.min(pasted.length, LENGTH - 1)]?.focus()
  }

  const submit = async () => {
    if (!complete) return
    setLoading(true)
    try {
      const arena = await verifyArenaCode(digits.join(''))
      console.log('arena', arena)
    } catch (err) {
      console.error('Failed to create arena', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-cyan '>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-20'></div>
      <div className='lg:w-132 flex h-dvh flex-col gap-8 justify-center w-full px-4 z-10'>
        <Image src={Character} alt='logo' loading='eager' />
        <div className='w-full flex flex-col items-center text-center uppercase text-6xl'>Enter Arena Code</div>
        <p className='text-center text-xl font-(family-name:--font-inter-tight)'>Ask the host for the 6 digit code</p>
        <div className='flex justify-center gap-2 sm:gap-3'>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => {
                refs.current[i] = el
              }}
              value={digit}
              onChange={e => onChange(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              onPaste={onPaste}
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
        <div className='w-full flex justify-center'>
          <Button type='button' text='Join' loadingText='Joining...' loading={loading} disabled={!complete} onClick={submit} />
        </div>
      </div>
    </div>
  )
}

