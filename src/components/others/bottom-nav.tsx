'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'fixtures', label: 'Fixtures', href: '/fixtures' },
    { id: 'stats', label: 'Stats', href: '/stats' },
    { id: 'more', label: 'More', href: '/more' },
  ]

  const navRoutes = {
    home: ['/'],
    fixtures: ['/fixtures'],
    stats: ['/stats'],
    more: ['/more', '/profile', '/settings'],
  }

  const route = navItems.find(item => navRoutes[item.id as keyof typeof navRoutes].includes(pathname))
  return (
    <nav className='w-full bg-card absolute bottom-0 left-0 right-0 z-20'>
      <div className='grid grid-cols-4 items-center justify-around'>
        {navItems.map(item => {
          const isActive = route?.id === item.id
          return (
            <Link key={item.id} href={item.href} className={cn('flex flex-col items-center justify-center gap-1 py-3 px-4 min-w-fit transition-colors h-16', isActive ? 'text-black bg-primary' : 'text-muted-foreground hover:text-foreground bg-card')}>
              <span className='text-lg font-(family-name:--font-display) uppercase'>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
