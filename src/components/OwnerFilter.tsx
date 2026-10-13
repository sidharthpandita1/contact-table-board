import { X } from 'lucide-react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { cn } from '../lib/cn'
import { UNASSIGNED } from '../lib/filter'
import { EASE_OUT } from '../lib/motion'
import { playSound } from '../lib/sound'
import { ownerHue } from '../theme'
import { Avatar } from './Avatar'

interface OwnerFilterProps {
  options: { value: string; label: string; count: number }[]
  selected: string[]
  onChange: (owners: string[]) => void
}

const JOIN = { duration: 0.24, ease: EASE_OUT }

/**
 * Toggle chips. Neighbouring selected chips close the gap and square their touching
 * corners, so a selection reads as one continuous track (after Spotify's library filters).
 */
export function OwnerFilter({ options, selected, onChange }: OwnerFilterProps) {
  const reduce = useReducedMotion()
  const isOn = (value: string) => selected.includes(value)

  /** Direction carries the state: on rises, off falls. */
  function toggle(value: string) {
    const on = isOn(value)
    playSound(on ? 'toggleOff' : 'toggleOn')
    onChange(on ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div role="group" aria-label="Filter by owner" className="flex items-center">
      {options.map((option, i) => {
        const on = isOn(option.value)
        const joinLeft = on && i > 0 && isOn(options[i - 1].value)
        const joinRight = on && i < options.length - 1 && isOn(options[i + 1].value)
        const r = (joined: boolean) => (joined ? 0 : 14)
        return (
          <m.button
            key={option.value}
            type="button"
            aria-pressed={on}
            aria-label={`${option.label}, ${option.count} ${option.count === 1 ? 'contact' : 'contacts'}`}
            onClick={() => toggle(option.value)}
            initial={false}
            animate={{
              marginLeft: i === 0 || joinLeft ? 0 : 6,
              borderTopLeftRadius: r(joinLeft),
              borderBottomLeftRadius: r(joinLeft),
              borderTopRightRadius: r(joinRight),
              borderBottomRightRadius: r(joinRight),
            }}
            transition={reduce ? { duration: 0 } : JOIN}
            className={cn(
              'relative inline-flex h-7 shrink-0 items-center gap-1.5 pr-2.5 pl-1 text-[13px] font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-150',
              on
                ? 'bg-neutral-900/[0.08] text-neutral-900'
                : 'text-neutral-600 shadow-[inset_0_0_0_1px_var(--color-hairline-strong)] hover:bg-neutral-900/[0.03] hover:text-neutral-900',
              joinLeft &&
                'before:absolute before:inset-y-1.5 before:left-0 before:w-px before:bg-neutral-900/10',
            )}
          >
            {option.value === UNASSIGNED ? (
              <span
                aria-hidden="true"
                className="size-5 rounded-full border border-dashed border-neutral-400"
              />
            ) : (
              <Avatar name={option.label} size="xs" hue={ownerHue(option.label)} />
            )}
            {/* Names collapse to avatar + count when the card is narrow (e.g. beside the panel). */}
            <span className="hidden @4xl:inline">{option.label}</span>
            <span aria-hidden="true" className="text-neutral-500 tabular-nums">
              {option.count}
            </span>
          </m.button>
        )
      })}
      <AnimatePresence initial={false}>
        {selected.length > 0 && (
          <m.button
            type="button"
            onClick={() => {
              playSound('clear')
              onChange([])
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="ml-1.5 inline-flex h-7 items-center gap-1 rounded-full px-2 text-[13px] text-neutral-500 hover:bg-neutral-900/[0.05] hover:text-neutral-900"
          >
            <X aria-hidden="true" className="size-3.5" />
            Clear
          </m.button>
        )}
      </AnimatePresence>
    </div>
  )
}
