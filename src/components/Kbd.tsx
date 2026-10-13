import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/** Keyboard hint. Decorative by default; the action it hints at has its own accessible name. */
export function Kbd({
  children,
  className,
  dark,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <kbd
      aria-hidden="true"
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 font-sans text-[11px] leading-none font-medium',
        dark
          ? 'bg-white/15 text-white/80'
          : 'bg-white text-neutral-500 shadow-[inset_0_0_0_1px_var(--color-hairline-strong),0_1px_0_var(--color-hairline)]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
