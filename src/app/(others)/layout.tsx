import React from 'react'
import { ArrowLeft } from 'lucide-react'
import PageTitle from '@/components/others/page-title'

const BaseLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className='w-full h-full'>
      <PageTitle />
      {children}
    </div>
  )
}

export default BaseLayout
