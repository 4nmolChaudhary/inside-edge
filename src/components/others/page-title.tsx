'use client'

import { ArrowLeft } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

export default function PageTitle() {
  const pathname = usePathname()
  const router = useRouter()
  const routeName = pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ').toUpperCase() ?? ''

  return (
    <div className='w-full p-4 pb-2 border-b-4 border-primary flex items-center gap-3'>
      <ArrowLeft size={18} className='cursor-pointer' onClick={() => router.push('/')} />
      <div className='text-2xl font-(family-name:--font-display) uppercase'>{routeName}</div>
    </div>
  )
}
