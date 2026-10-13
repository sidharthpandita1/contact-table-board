import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-neutral-900 text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.12),0_1px_2px_oklch(0_0_0/0.2)] hover:bg-neutral-800',
  secondary:
    'bg-white text-neutral-800 shadow-[inset_0_0_0_1px_var(--color-hairline-strong),0_1px_2px_oklch(0_0_0/0.05)] hover:bg-neutral-50',
  danger:
    'bg-red-600 text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.15),0_1px_2px_oklch(0_0_0/0.2)] hover:bg-red-700',
  ghost: 'text-neutral-600 hover:bg-neutral-900/[0.05] hover:text-neutral-900',
}

/** Press feedback: a 0.97 scale on :active, the one animation that is welcome on every click. */
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
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-medium',
        'transition-[background-color,scale] duration-150 ease-out active:scale-[0.97]',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
