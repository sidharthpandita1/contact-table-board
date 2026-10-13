import { cn } from '../lib/cn'
import type { Stage } from '../types'

export function StageDot({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      aria-hidden="true"
      data-tone={stage}
      className={cn('tone-dot inline-block size-1.5 shrink-0 rounded-full', className)}
    />
  )
}

/** Tinted pill with a same-hue hairline ring and a dot, so stage never relies on colour alone. */
export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      data-tone={stage}
      className={cn(
        'tone-pill inline-flex h-[22px] items-center gap-1.5 rounded-full pr-2 pl-1.5 text-[12.5px] font-medium whitespace-nowrap',
        className,
      )}
    >
      <span aria-hidden="true" className="tone-dot size-1.5 rounded-full" />
      <span className="text-trim">{stage}</span>
    </span>
  )
}
