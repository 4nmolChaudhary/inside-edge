import React from 'react'
import { Input } from '@/components/ui/input'

import { cn } from '@/lib/utils'

type Error = {
  message?: string
}

type TextInputProps = React.ComponentProps<'input'> & {
  className?: string
  type?: string
  label?: string
  error?: Error
  containerClasses?: string
  children?: React.ReactNode
}

export const TextInput = ({ containerClasses, label, type = 'text', children, error, ...props }: TextInputProps) => {
  const bgClass = error?.message ? `bg-red-600/[0.3] dark:bg-red-600/[0.5]` : ``
  const borderClass = error?.message ? `border-red-600` : ``
  const labelClass = error?.message ? `text-red-600` : `opacity-50`
  return (
    <div className={cn('mb-2 w-full min-w-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm aria-invalid:border-destructive', containerClasses)}>
      <label className={`text-sm font-(family-name:--font-display) uppercase ${labelClass}`}>{label}</label>
      <Input type={type} {...props} className={`py-3 font-(family-name:--font-inter-tight) ${bgClass} ${borderClass}`} />
      {children}
      <div className='text-xs text-red-600 font-(family-name:--font-inter-tight)'>{error?.message}</div>
    </div>
  )
}
