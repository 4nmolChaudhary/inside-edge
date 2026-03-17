'use client'
import { authClient } from '@/lib/auth-client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const Card = ({ title, className, bg, onClick }: { title: string; bg: string; className: string; onClick: () => void }) => {
  return (
    <div className={cn('p-4 bg-primary relative', className)} onClick={onClick}>
      <div className={cn('w-full h-full bg-cover absolute top-0 left-0 z-0', bg)}></div>
      <span className={cn('relative text-4xl font-(family-name:--font-display) uppercase z-10')}>{title}</span>
    </div>
  )
}
const Main = () => {
  const router = useRouter()
  const logOut = async () => await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/') } })
  const redirectTo = (path: string) => router.push(`/${path}`)
  return (
    <div className='w-full h-full p-4 flex flex-col gap-3 text-2xl font-(family-name:--font-display) uppercase'>
      <Card title='Teams' bg='bg-[url(/images/teams-bg.jpg)] opacity-10' className='h-70 cursor-pointer' onClick={() => redirectTo('teams')} />
      <Card title='Players' bg='bg-[url(/images/players-bg.jpg)] opacity-15 bg-contain bg-no-repeat bg-end' className='h-50 cursor-pointer' onClick={() => redirectTo('players')} />
      <Card title='Matches' bg='bg-[url(/images/bg-card-one.jpg)] opacity-10 bg-no-repeat' className='h-30 cursor-pointer' onClick={() => redirectTo('matches')} />
      <Card title='Log out' bg='bg-[url(/images/bg-card-one.jpg)] opacity-10 bg-no-repeat' className='h-30 cursor-pointer' onClick={() => logOut()} />
    </div>
  )
}

export default Main
