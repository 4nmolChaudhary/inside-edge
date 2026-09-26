'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/form/button'
import { Code } from '@/components/form/code'
import Character from '@/assets/images/character-1.png'
import { useVerifyArenaCode } from '@/api/arenas'

const LENGTH = 6

export default function Arena() {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const router = useRouter()
  const { mutate, isPending } = useVerifyArenaCode({ onSuccess: arena => router.push(`/home?arena=${arena.id}`) })

  const code = digits.join('')
  const complete = code.length === LENGTH

  const submit = () => {
    if (!complete || isPending) return
    mutate(code)
  }

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-cyan '>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-20'></div>
      <div className='lg:w-132 flex h-dvh flex-col gap-8 justify-center w-full px-4 z-10'>
        <Image src={Character} alt='logo' loading='eager' />
        <div className='w-full flex flex-col items-center text-center uppercase text-6xl'>Enter Arena Code</div>
        <p className='text-center text-xl font-(family-name:--font-inter-tight)'>Ask the host for the 6 digit code</p>
        <div onKeyDown={e => e.key === 'Enter' && submit()}>
          <Code value={digits} setValue={setDigits} />
        </div>
        <div className='w-full flex justify-center'>
          <Button type='button' text='Join' loadingText='Joining...' loading={isPending} disabled={!complete} onClick={submit} />
        </div>
      </div>
    </div>
  )
}

