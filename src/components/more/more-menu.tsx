'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'
import useDialogState from '@/hooks/use-dialog-state'
import { AuthorizeDialog } from '@/components/more/authorize-dialog'
import { AddPlayerDialog } from '@/components/more/add-player-dialog'
import Authorize from '@/assets/images/authorize.png'
import AddUpdatePlayer from '@/assets/images/add-update-player.png'
import AddUpdateTeam from '@/assets/images/add-update-team.png'
import StartScoring from '@/assets/images/start-scoring.png'

const tileClass = 'relative flex flex-col justify-between overflow-hidden rounded-xl p-4 text-left transition-transform active:scale-[0.98] bg-violet text-white'
const disabledClass = 'opacity-40 cursor-not-allowed active:scale-100'
const imageClass = 'absolute right-0 bottom-0 h-3/4 w-auto max-w-full object-contain'

const Tile = ({ name, image, subText }: { name: string; image: typeof Authorize; subText?: string }) => (
  <>
    <div className='relative z-10 flex flex-col gap-1'>
      <span className='text-4xl uppercase leading-none'>{name}</span>
      {subText && <span className='text-sm uppercase tracking-wide text-white/70 font-(family-name:--font-inter-tight)'>{subText}</span>}
    </div>
    <Image src={image} loading='eager' alt='' className={imageClass} />
  </>
)

export const MoreMenu = ({ isAuthenticated, arenaId }: { isAuthenticated: boolean; arenaId?: string }) => {
  const router = useRouter()
  const { isOpen, onOpenChange, onClose } = useDialogState()
  const playerDialog = useDialogState()
  const canManage = isAuthenticated && !!arenaId

  const onAuthorized = () => {
    onClose()
    router.refresh()
  }

  return (
    <>
      <button type='button' disabled={isAuthenticated} onClick={onOpenChange} className={cn(tileClass, isAuthenticated && 'cursor-default active:scale-100')}>
        <Tile name={isAuthenticated ? 'Authorized' : 'Authorize'} image={Authorize} />
      </button>
      <button type='button' disabled={!canManage} onClick={playerDialog.onOpenChange} className={cn(tileClass, !canManage && disabledClass)}>
        <Tile name='Add Player' image={AddUpdatePlayer} />
      </button>
      <button type='button' disabled className={cn(tileClass, disabledClass)}>
        <Tile name='Add Team' subText='Coming soon' image={AddUpdateTeam} />
      </button>
      {isAuthenticated ? (
        <Link href='/scoring' className={tileClass}>
          <Tile name='Start Scoring' image={StartScoring} />
        </Link>
      ) : (
        <div aria-disabled='true' className={cn(tileClass, disabledClass)}>
          <Tile name='Start Scoring' image={StartScoring} />
        </div>
      )}
      <AuthorizeDialog open={isOpen} onOpenChange={onOpenChange} onAuthorized={onAuthorized} />
      {arenaId && (
        <>
          <AddPlayerDialog open={playerDialog.isOpen} onOpenChange={playerDialog.onOpenChange} arenaId={arenaId} />
        </>
      )}
    </>
  )
}

