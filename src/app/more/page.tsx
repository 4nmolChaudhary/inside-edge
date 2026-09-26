import { isAuthorized } from '@/lib/authorize'
import { MoreMenu } from '@/components/more/more-menu'

const More = async ({ searchParams }: { searchParams: Promise<{ arena?: string }> }) => {
  const { arena } = await searchParams
  const isAuthenticated = await isAuthorized()

  return (
    <div className='w-full flex justify-center font-(family-name:--font-display) bg-card'>
      <div className='w-full h-full bg-cover absolute top-0 left-0 z-0 bg-[url(/images/bg-card-one.jpg)] opacity-5'></div>
      <div className='lg:w-132 h-dvh w-full p-4 grid grid-cols-2 grid-rows-2 gap-3 z-10'>
        <MoreMenu isAuthenticated={isAuthenticated} arenaId={arena} />
      </div>
    </div>
  )
}

export default More
