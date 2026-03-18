'use client'
import { useState } from 'react'
import { Button } from '@/components/form/button'

import { useTeams } from '@/api/teams'
import AddEditTeam from '@/components/teams/add-edit-team'

import { TEAM_IMAGES, TEAM_COLORS } from '@/constants/images'
import Image from 'next/image'

const Page = () => {
  const { data } = useTeams()
  const [isEditing, setIsEditing] = useState(false)
  console.log(data)
  if (isEditing) return <AddEditTeam onCancel={() => setIsEditing(false)} />
  return (
    <div className='w-full flex flex-col gap-3 text-2xl font-(family-name:--font-display)'>
      <div className='flex items-center justify-between border-b border-primary/50 border-dashed p-4'>
        <div>
          <div className='text-3xl font-(family-name:--font-display) tracking-tight uppercase'>Teams</div>
          <div className='text-sm text-neutral-500 font-(family-name:--font-inter-tight)'>Manage your teams and team members</div>
        </div>
        <Button onClick={() => setIsEditing(true)} className='flex items-center cursor-pointer' text='Add team' />
      </div>
      <div className='w-full h-[calc(100vh-170px)] text-2xl font-(family-name:--font-display) overflow-y-auto grid grid-cols-2 gap-4 p-4 pt-0 scrollbar-hide'>
        {data?.map(team => (
          <div key={team.id} className='flex p-4 items-center flex-col cursor-pointer' style={{ backgroundColor: TEAM_COLORS[Number(team.logo) || 0] }}>
            <Image src={TEAM_IMAGES[Number(team.logo) || 0]} alt='team picture' className='w-32 aspect-square object-cover' />
            <div className='w-full uppercase text-center'>{team.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page
