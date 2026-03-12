'use client'
import { authClient } from '@/lib/auth-client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

import { Bug, ChartNoAxesCombined, ChessQueen, LogIn, LogOut, Telescope, Trophy, User } from 'lucide-react'

const More = () => {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const logOut = async () => await authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/') } })
  const redirectTo = (path: string) => router.push(`/${path}`)
  const openGithub = () => window.open('https://github.com/4nmolChaudhary', '_')

  const playerMenuItems = [
    { type: 'simple', id: 'profile', name: 'Profile', onClick: () => redirectTo('profile'), className: 'col-start-1 row-start-1' },
    { type: 'simple', id: 'performance', name: 'Performance', onClick: () => redirectTo('performance'), className: 'col-start-2 row-start-1' },
    { type: 'simple', id: 'my-stats', name: 'My Stats', onClick: () => redirectTo('my-stats'), className: 'col-start-1 row-start-2 row-span-2' },
    { type: 'simple', id: 'achievements', name: 'Achievements', onClick: () => redirectTo('achievements'), className: 'col-start-2 row-start-2' },
    { type: 'custom', id: 'credits', name: 'Credits', onClick: openGithub, className: 'col-start-2 row-start-3 row-span-2 bg-[url(/images/bg-credits.gif)] bg-cover bg-center text-black' },
    { type: 'simple', id: 'report-an-issue', name: 'Report an Issue', onClick: () => redirectTo('report-an-issue'), className: 'col-start-1 row-start-4' },
    { type: 'simple', id: 'logout', name: 'Logout', onClick: logOut, className: 'col-start-1 row-start-5 col-span-2' },
  ]

  const publicMenuItems = [
    { type: 'simple', id: 'explore', name: 'Explore Players', onClick: () => redirectTo('performance'), className: 'col-start-1 row-start-1 col-span-2' },
    { type: 'simple', id: 'my-stats', name: 'Check Stats', onClick: () => redirectTo('my-stats'), className: 'col-start-1 row-start-2 col-span-2' },
    { type: 'custom', id: 'credits', name: 'Credits', onClick: openGithub, className: 'col-start-2 row-start-3 row-span-2 bg-[url(/images/bg-credits.gif)] bg-cover bg-center text-black' },
    { type: 'simple', id: 'report-an-issue', name: 'Report an Issue', onClick: () => redirectTo('report-an-issue'), className: 'col-start-1 row-start-3 row-span-2' },
    { type: 'simple', id: 'sign-in', name: 'Sign In', onClick: () => redirectTo('auth'), className: 'col-start-1 row-start-5 col-span-2' },
  ]

  const icons = {
    profile: <User size={60} />,
    performance: <ChessQueen size={60} />,
    'my-stats': <ChartNoAxesCombined size={60} />,
    achievements: <Trophy size={60} />,
    'report-an-issue': <Bug size={60} />,
    logout: <LogOut size={60} />,
    'sign-in': <LogIn size={60} />,
    explore: <Telescope size={60} />,
  }

  const menuItems = [...(!session ? publicMenuItems : playerMenuItems)]

  return (
    <div className='w-full h-[calc(100%-124px)] p-4 gap-3 text-2xl font-(family-name:--font-display) uppercase'>
      <div className='grid grid-cols-2 grid-rows-5 w-full h-full gap-4'>
        {menuItems.map(item => {
          return (
            <div key={item.id} className={cn('p-4 bg-primary relative', item.className)} onClick={item?.onClick}>
              <div className={cn('w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-10', item.type === 'custom' && 'hidden')}></div>
              <span className={cn('relative text-2xl font-(family-name:--font-display) uppercase z-10', item.type === 'custom' && 'p-2 bg-accent text-black')}>{item.name}</span>
              {icons[item.id as keyof typeof icons]}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default More
