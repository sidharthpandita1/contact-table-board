import { SquareKanban, Table2 } from 'lucide-react'
import { LayoutGroup, m } from 'motion/react'
import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { VIEW_PANEL_ID, tabId } from '../lib/dom'
import { SNAPPY } from '../lib/motion'
import type { ViewMode } from '../types'

const VIEWS = [
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'board', label: 'Board', icon: SquareKanban },
] as const

interface ViewSwitcherProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
}

/**
 * Looks like a segmented control, behaves like WAI-ARIA tabs: one tab stop,
 * arrow keys / Home / End move between views and activate them immediately.
 * The white thumb slides between options as one shared element.
 */
export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const tabs = useRef(new Map<ViewMode, HTMLButtonElement>())

  function onKeyDown(e: KeyboardEvent) {
    const current = VIEWS.findIndex((v) => v.id === value)
    const next =
      e.key === 'ArrowRight'
        ? (current + 1) % VIEWS.length
        : e.key === 'ArrowLeft'
          ? (current - 1 + VIEWS.length) % VIEWS.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? VIEWS.length - 1
              : null
    if (next === null) return
    e.preventDefault()
    const id = VIEWS[next].id
    onChange(id)
    tabs.current.get(id)?.focus()
  }

  return (
    <LayoutGroup id="view-switcher">
      <div
        role="tablist"
        aria-label="Views"
        onKeyDown={onKeyDown}
        className="inline-flex shrink-0 rounded-[10px] bg-neutral-900/[0.05] p-[3px]"
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const selected = id === value
          return (
            <button
              key={id}
              ref={(el) => {
                if (el) tabs.current.set(id, el)
                else tabs.current.delete(id)
              }}
              type="button"
              role="tab"
              id={tabId(id)}
              aria-selected={selected}
              aria-controls={VIEW_PANEL_ID}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(id)}
              className={cn(
                'relative isolate inline-flex h-[26px] items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] font-medium transition-colors duration-150',
                selected ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-800',
              )}
            >
              {selected && (
                <m.span
                  layoutId="view-thumb"
                  transition={SNAPPY}
                  className="absolute inset-0 -z-10 rounded-[7px] bg-white shadow-thumb"
                />
              )}
              <Icon aria-hidden="true" className="size-3.5" />
              {label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
