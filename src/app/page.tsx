'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/form/button'
import Logo from '@/assets/images/logo.png'

export default function Home() {
  const router = useRouter()
  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-sporty-red'>
      <div className='lg:w-132 flex h-dvh flex-col gap-8 justify-center w-full'>
        <Image src={Logo} alt='logo' loading='eager' />
        <div className='w-full flex flex-col items-center text-center uppercase text-6xl'>Every Ball Counts When You're Playing Like Kings.</div>
        <div className='w-full flex justify-center'>
          <Button type='button' text='Continue' onClick={() => router.push('/arena')} />
        </div>
      </div>
    </div>
  )
}

