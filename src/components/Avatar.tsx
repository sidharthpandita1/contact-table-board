import type { CSSProperties } from 'react'
import { cn } from '../lib/cn'
import { initials } from '../lib/format'
import { hueFor } from '../theme'

const SIZES = {
  xs: 'size-5 text-[9px]',
  sm: 'size-6 text-[10px]',
  lg: 'size-11 text-[15px]',
}

interface AvatarProps {
  name: string
  size?: keyof typeof SIZES
  /** OKLCH hue. Defaults to a stable hue derived from the name. */
  hue?: number
  className?: string
}

/** Decorative initials on a soft two-stop tint. Always paired with text naming the person. */
export function Avatar({ name, size = 'sm', hue = hueFor(name), className }: AvatarProps) {
  const style = {
    backgroundImage: `linear-gradient(140deg, oklch(0.95 0.035 ${hue}), oklch(0.87 0.075 ${hue + 28}))`,
    color: `oklch(0.4 0.1 ${hue})`,
    boxShadow: `inset 0 0 0 1px oklch(0.4 0.1 ${hue} / 0.12)`,
  } satisfies CSSProperties
  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold tracking-tight',
        SIZES[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
