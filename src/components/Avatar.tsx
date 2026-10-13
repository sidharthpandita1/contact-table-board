import { initials } from '../lib/format'
import { cn } from '../lib/cn'

interface AvatarProps {
  name: string
  size?: 'sm' | 'lg'
  /** Background and text classes. Defaults to neutral. */
  tint?: string
}

/** Decorative initials. Always paired with visible or screen-reader text naming the person. */
export function Avatar({
  name,
  size = 'sm',
  tint = 'bg-neutral-200 text-neutral-700',
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        size === 'sm' ? 'size-5 text-[9px]' : 'size-10 text-sm',
        tint,
      )}
    >
      {initials(name)}
    </span>
  )
}
