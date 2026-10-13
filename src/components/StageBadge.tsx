import { cn } from '../lib/cn'
import { STAGE_STYLES } from '../theme'
import type { Stage } from '../types'

export function StageDot({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        STAGE_STYLES[stage].dot,
        className,
      )}
    />
  )
}

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded px-1.5 text-xs font-medium whitespace-nowrap',
        STAGE_STYLES[stage].chip,
      )}
    >
      <StageDot stage={stage} className="size-1.5" />
      {stage}
    </span>
  )
}
