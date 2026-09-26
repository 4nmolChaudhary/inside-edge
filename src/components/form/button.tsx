import React from 'react'
import { Button as ButtonBase } from '@/components/ui/button'

type ButtonProps = React.ComponentProps<'button'> & {
  className?: string
  children?: React.ReactNode
  loading?: boolean
  text?: string
  loadingText?: string
}

export const Button = ({ className, loading, text, loadingText, ...rest }: ButtonProps) => {
  return (
    <ButtonBase disabled={loading || rest?.disabled} className={`rounded-xl min-w-1/2 bg-black text-5xl! cursor-pointer px-4 py-3 ${className}`} {...rest}>
      <span>{loading ? loadingText : text}</span>
    </ButtonBase>
  )
}
