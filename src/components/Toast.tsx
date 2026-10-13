import { Check, Undo2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ContactPatch } from '../types'

export interface ToastMessage {
  /** Changes on every save so a new toast starts fresh. */
  key: number
  text: string
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
 * Secondary feedback after a save. The row or card highlight is the primary signal.
 * Bottom-left so it never covers the docked panel's Save and Cancel.
 * The live region stays mounted so screen readers announce each new message.
 */
export function Toast({ toast, onUndo, onDismiss }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-6 z-[60]"
    >
      {toast && <ToastBody key={toast.key} toast={toast} onUndo={onUndo} onDismiss={onDismiss} />}
    </div>
  )
}

/** Keyed per message, so the pause state and timer never leak from one toast to the next. */
function ToastBody({ toast, onUndo, onDismiss }: ToastProps & { toast: ToastMessage }) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = window.setTimeout(onDismiss, DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [paused, onDismiss])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex items-center gap-2 rounded-lg bg-neutral-900 py-1.5 pr-1.5 pl-3 text-[13px] text-white shadow-lg transition-[opacity,translate] duration-200 starting:translate-y-2 starting:opacity-0"
    >
      <Check aria-hidden="true" className="size-4 shrink-0 text-emerald-400" />
      <span className="max-w-[48ch] truncate">{toast.text}</span>
      <button
        type="button"
        onClick={() => onUndo(toast)}
        className="ml-1 inline-flex h-7 items-center gap-1 rounded-md px-2 font-medium text-sky-300 hover:bg-white/10"
      >
        <Undo2 aria-hidden="true" className="size-3.5" />
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="inline-flex size-7 items-center justify-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  )
}
