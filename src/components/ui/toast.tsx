'use client'
import * as React from 'react'
import { Toast } from '@base-ui/react/toast'
import { CircleCheckIcon, InfoIcon, LoaderCircleIcon, OctagonXIcon, TriangleAlertIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const toast = Toast.createToastManager()

const TOAST_ICONS = {
  success: { Icon: CircleCheckIcon, className: 'text-white' },
  info: { Icon: InfoIcon, className: 'text-cyan' },
  warning: { Icon: TriangleAlertIcon, className: 'text-yellow' },
  error: { Icon: OctagonXIcon, className: 'text-white' },
  loading: { Icon: LoaderCircleIcon, className: 'text-violet animate-spin' },
}

function ToastIcon({ type }: { type?: string }) {
  const icon = TOAST_ICONS[type as keyof typeof TOAST_ICONS]
  if (!icon) return null
  return <icon.Icon aria-hidden='true' className={cn('size-5 shrink-0', icon.className)} />
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map(item => (
    <Toast.Root
      key={item.id}
      toast={item}
      swipeDirection={['up', 'right']}
      data-slot='toast'
      className={cn(
        // stacking: newest toast in front, older ones peek out underneath
        'group/toast absolute inset-x-0 top-0 z-[calc(1000-var(--toast-index))] h-(--height) w-full origin-top cursor-default select-none',
        '[--gap:0.75rem] [--peek:0.5rem] [--scale:calc(max(0,1-(var(--toast-index)*0.05)))] [--shrink:calc(1-var(--scale))] [--height:var(--toast-frontmost-height,var(--toast-height))]',
        '[--offset-y:calc(var(--toast-offset-y)+(var(--toast-index)*var(--gap))+var(--toast-swipe-movement-y))]',
        'transform-[translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)+(var(--toast-index)*var(--peek))+(var(--shrink)*var(--height))))_scale(var(--scale))]',
        'transition-[transform,opacity,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        // hover area between toasts so the stack doesn't collapse while moving the pointer
        'after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-[""]',
        'data-expanded:h-(--toast-height) data-expanded:transform-[translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'data-starting-style:transform-[translateY(-150%)] data-limited:opacity-0',
        'data-ending-style:opacity-0 data-ending-style:transform-[translateY(-150%)]',
        'data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-ending-style:data-[swipe-direction=right]:transform-[translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=up]:transform-[translateY(calc(var(--toast-swipe-movement-y)-150%))]',
      )}
    >
      <Toast.Content
        className={cn(
          'relative flex h-full w-full items-center gap-3 overflow-hidden rounded-xl border border-white/20 bg-card p-3 text-white shadow-lg transition-opacity duration-300',
          'group-data-[type=success]/toast:border-green group-data-[type=success]/toast:bg-green group-data-[type=error]/toast:border-sporty-red group-data-[type=error]/toast:bg-sporty-red group-data-[type=info]/toast:border-cyan group-data-[type=warning]/toast:border-yellow group-data-[type=loading]/toast:border-violet',
          'not-data-expanded:data-behind:pointer-events-none not-data-expanded:data-behind:opacity-0',
        )}
      >
        <ToastIcon type={item.type} />
        <div className='min-w-0 flex-1'>
          <Toast.Title data-slot='toast-title' className='text-xl leading-none font-(family-name:--font-display) uppercase empty:hidden' />
          {item.actionProps && (
            <Toast.Action className='mt-2 inline-flex h-7 cursor-pointer items-center justify-center rounded-xl bg-primary px-3 text-lg leading-none text-black group-data-[type=success]/toast:bg-white group-data-[type=error]/toast:bg-white font-(family-name:--font-display) uppercase transition-colors outline-none hover:bg-primary/90 group-data-[type=success]/toast:hover:bg-white/90 group-data-[type=error]/toast:hover:bg-white/90 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50' />
          )}
        </div>
      </Toast.Content>
    </Toast.Root>
  ))
}

function Toaster() {
  return (
    <Toast.Provider toastManager={toast}>
      <Toast.Portal>
        <Toast.Viewport data-slot='toaster' className='pointer-events-auto fixed top-4 left-1/2 z-2147483647 w-[calc(100%-2rem)] -translate-x-1/2 outline-none sm:max-w-sm'>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}

export { Toaster, toast }
