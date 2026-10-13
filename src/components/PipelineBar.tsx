import { m, useReducedMotion } from 'motion/react'
import { EASE_OUT } from '../lib/motion'
import { STAGES, type Stage } from '../types'
import { RollingNumber } from './RollingNumber'

/**
 * The whole pipeline at a glance. Segment widths follow the counts and animate when a
 * contact changes stage, in either view.
 */
export function PipelineBar({ counts }: { counts: Record<Stage, number> }) {
  const reduce = useReducedMotion()
  const summary = STAGES.map((s) => `${s} ${counts[s]}`).join(', ')
  return (
    <div className="flex items-center gap-4">
      <div
        role="img"
        aria-label={`Pipeline: ${summary}`}
        className="flex h-1.5 w-36 overflow-hidden rounded-full bg-neutral-900/[0.05]"
      >
        {STAGES.map((stage) => (
          <m.span
            key={stage}
            data-tone={stage}
            className="tone-dot h-full"
            initial={false}
            animate={{ flexGrow: counts[stage], marginRight: counts[stage] ? 2 : 0 }}
            transition={{ duration: reduce ? 0 : 0.45, ease: EASE_OUT }}
            style={{ flexBasis: 0 }}
          />
        ))}
      </div>
      <ul aria-hidden="true" className="hidden items-center gap-3 text-xs text-neutral-500 lg:flex">
        {STAGES.map((stage) => (
          <li key={stage} className="flex items-center gap-1.5">
            <span data-tone={stage} className="tone-dot size-1.5 rounded-full" />
            {stage}
            <RollingNumber value={counts[stage]} className="font-medium text-neutral-800" />
          </li>
        ))}
      </ul>
    </div>
  )
}
