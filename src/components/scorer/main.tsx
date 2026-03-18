'use client'
import { authClient } from '@/lib/auth-client'
import { ArrowUpRight } from 'lucide-react'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const Card = ({ title, className, bg, onClick }: { title: string; bg: string; className?: string; onClick: () => void }) => {
  return (
    <div className={cn('p-4 bg-primary relative cursor-pointer', className)} onClick={onClick}>
      <ArrowUpRight className='absolute top-4 right-4 z-10' />
      <div className={cn('w-full h-full bg-cover absolute top-0 left-0 z-0', bg)}></div>
      <span className={cn('absolute bottom-4 left-4 text-2xl font-(family-name:--font-display) uppercase z-10')}>{title}</span>
    </div>
  )
}
const Main = () => {
  const router = useRouter()
  const logOut = async () => await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/') } })
  const redirectTo = (path: string) => router.push(`/${path}`)
  return (
    <div className='w-full h-full p-4 grid grid-cols-2 grid-rows-3 gap-4'>
      <Card title='Players' bg='bg-[url(/images/bg-players.png)] opacity-30 mix-blend-multiply bg-contain bg-no-repeat bg-center' className='col-start-1 row-start-1 row-span-2' onClick={() => redirectTo('players')} />
      <Card title='Teams' bg='bg-[url(/images/bg-teams.png)] opacity-30' className='col-start-2 row-start-1' onClick={() => redirectTo('teams')} />
      <Card title='Matches' bg='bg-[url(/images/bg-matches.png)] opacity-30 bg-no-repeat' onClick={() => redirectTo('matches')} />
      <Card title='Log out' bg='bg-[url(/images/bg-out.png)] opacity-30 bg-no-repeat' onClick={() => logOut()} />
      <Card title='Match Setup' bg='bg-[url(/images/bg-match-setup.png)] mix-blend-multiply opacity-30 bg-no-repeat' onClick={() => redirectTo('match setup')} />
    </div>
  )
}

export default Main
