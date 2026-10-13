import { Undo2, X } from 'lucide-react'
import { AnimatePresence, m, useIsPresent } from 'motion/react'
import { useEffect, useState } from 'react'
import type { SaveSummary } from '../lib/describeSave'
import { EASE_OUT } from '../lib/motion'
import type { ContactPatch } from '../types'
import { Kbd } from './Kbd'
import { StageBadge } from './StageBadge'

export interface ToastMessage extends SaveSummary {
  /** Changes on every save so a new toast starts fresh. */
  key: number
  contactId: string
  /** The previous values of exactly the fields that were saved. */
  undo: ContactPatch
}

interface ToastProps {
  toast: ToastMessage | null
  onUndo: (toast: ToastMessage) => void
  onDismiss: () => void
}

const DURATION_MS = 6000

/**
 * Secondary feedback after a save or drop. The row or card highlight is the primary signal.
 * The live region stays mounted so screen readers announce each new message.
 */
export function Toast({ toast, onUndo, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 bottom-4 z-[60] flex justify-center px-4"
    >
      <AnimatePresence mode="popLayout">
        {toast && <ToastBody key={toast.key} toast={toast} onUndo={onUndo} onDismiss={onDismiss} />}
      </AnimatePresence>
    </div>
  )
}

/** Keyed per message, so the pause state and timer never leak from one toast to the next. */
function ToastBody({ toast, onUndo, onDismiss }: ToastProps & { toast: ToastMessage }) {
  const present = useIsPresent()
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(onDismiss, DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [paused, onDismiss])

  return (
    <m.div
      inert={!present}
      initial={{ opacity: 0, y: 14, scale: 0.97, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{
        opacity: 0,
        y: 8,
        scale: 0.98,
        filter: 'blur(2px)',
        transition: { duration: 0.16, ease: EASE_OUT },
      }}
      transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.12 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-white py-1.5 pr-1.5 pl-4 text-[13px] text-neutral-700 shadow-float"
    >
      <span className="sr-only">{toast.text}</span>
      <span aria-hidden="true" className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        {toast.stage ? (
          <>
            Moved <strong className="truncate font-medium text-neutral-900">{toast.name}</strong> to
            <StageBadge stage={toast.stage} />
            {toast.notesUpdated && <span className="text-neutral-500">· notes updated</span>}
          </>
        ) : (
          <>
            Updated notes for{' '}
            <strong className="truncate font-medium text-neutral-900">{toast.name}</strong>
          </>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onUndo(toast)}
          className="inline-flex h-7 items-center gap-1.5 rounded-full bg-neutral-900 pr-1.5 pl-2.5 text-[12.5px] font-medium text-white transition-[background-color,scale] duration-150 hover:bg-neutral-800 active:scale-[0.96]"
        >
          <Undo2 aria-hidden="true" className="size-3.5" />
          Undo
          <Kbd dark>⌘Z</Kbd>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="inline-flex size-7 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-900/[0.05] hover:text-neutral-800"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      </span>
    </m.div>
  )
}
