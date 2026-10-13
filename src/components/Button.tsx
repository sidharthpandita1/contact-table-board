import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondary:
    'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  ghost: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800',
}

export function Button({
  variant = 'secondary',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium transition-colors',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
