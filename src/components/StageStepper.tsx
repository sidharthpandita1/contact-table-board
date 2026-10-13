import { LayoutGroup, m } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { SNAPPY } from '../lib/motion'
import { PITCH_STEPS, playSound } from '../lib/sound'
import { STAGES, type Stage } from '../types'

interface StageStepperProps {
  value: Stage
  onChange: (stage: Stage) => void
  /** Applied to the checked radio, so "Keep editing" can return focus to it. */
  id?: string
  labelledBy: string
}

/**
 * The pipeline as a radio group. Stages up to the current one show a filled dot, later ones a
 * hollow ring, so the control also reads as progress. Arrow keys move and select, per the
 * WAI-ARIA radio pattern; the change is only a draft until Save.
 */
export function StageStepper({ value, onChange, id, labelledBy }: StageStepperProps) {
  const radios = useRef(new Map<Stage, HTMLButtonElement>())
  const current = STAGES.indexOf(value)

  /** Pitched by place: the further along the pipeline, the higher the note. */
  function choose(stage: Stage) {
    if (stage === value) return
    playSound('select', { detune: PITCH_STEPS[STAGES.indexOf(stage)] })
    onChange(stage)
  }

  function onKeyDown(e: KeyboardEvent) {
    const delta =
      e.key === 'ArrowRight' || e.key === 'ArrowDown'
        ? 1
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp'
          ? -1
          : 0
    if (!delta) return
    e.preventDefault()
    const next = STAGES[(current + delta + STAGES.length) % STAGES.length]
    choose(next)
    radios.current.get(next)?.focus()
  }

  return (
    <LayoutGroup id="stage-stepper">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        onKeyDown={onKeyDown}
        className="grid grid-cols-4 gap-0.5 rounded-[10px] bg-neutral-900/[0.05] p-[3px]"
      >
        {STAGES.map((stage, i) => {
          const checked = stage === value
          const reached = i <= current
          return (
            <button
              key={stage}
              ref={(el) => {
                if (el) radios.current.set(stage, el)
                else radios.current.delete(stage)
              }}
              type="button"
              role="radio"
              id={checked ? id : undefined}
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => choose(stage)}
              data-tone={stage}
              className={cn(
                'relative isolate flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-[7px] px-1 text-[12.5px] font-medium transition-colors duration-150',
                checked ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800',
              )}
            >
              {checked && (
                <m.span
                  layoutId="stage-thumb"
                  transition={SNAPPY}
                  className="absolute inset-0 -z-10 rounded-[7px] bg-white shadow-thumb"
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 shrink-0 rounded-full transition-[background-color,box-shadow] duration-200',
                  reached ? 'tone-dot' : 'shadow-[inset_0_0_0_1.5px_oklch(0_0_0/0.2)]',
                )}
              />
              <span className="truncate">{stage}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
