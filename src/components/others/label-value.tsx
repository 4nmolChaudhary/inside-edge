'use client'
import { cn } from '@/lib/utils'

export const LabelValue = ({ label, value, className, valueClassName, primaryClassname }: { label: string; value: string | number; className?: string; valueClassName?: string; primaryClassname?: string }) => {
  return (
    <div className={cn('flex flex-col gap-1', primaryClassname)}>
      <div className={cn('text-sm text-slate-500 font-(family-name:--font-inter-tight)', className)}>{label}</div>
      <div className={cn('text-4xl uppercase', valueClassName)}>{value}</div>
    </div>
  )
}
