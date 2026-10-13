import { SquareKanban, Table2 } from 'lucide-react'
import { useRef, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { VIEW_PANEL_ID, tabId } from '../lib/dom'
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
 */
export function ViewSwitcher({ value, onChange }: ViewSwitcherProps) {
  const tabs = useRef(new Map<ViewMode, HTMLButtonElement>())

  function onKeyDown(e: KeyboardEvent) {
    const current = VIEWS.findIndex((v) => v.id === value)
    const last = VIEWS.length - 1
    const next =
      e.key === 'ArrowRight'
        ? (current + 1) % VIEWS.length
        : e.key === 'ArrowLeft'
          ? (current - 1 + VIEWS.length) % VIEWS.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? last
              : null
    if (next === null) return
    e.preventDefault()
    const id = VIEWS[next].id
    onChange(id)
    tabs.current.get(id)?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label="Views"
      onKeyDown={onKeyDown}
      className="inline-flex gap-0.5 rounded-lg bg-neutral-100 p-0.5"
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
              'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors',
              selected
                ? 'bg-white text-neutral-900 shadow-xs ring-1 ring-neutral-900/5'
                : 'text-neutral-500 hover:text-neutral-900',
            )}
          >
            <Icon aria-hidden="true" className="size-3.5" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
