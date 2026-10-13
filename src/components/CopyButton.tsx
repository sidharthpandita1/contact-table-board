import { Check, Copy } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useEffect, useState } from 'react'
import { playSound } from '../lib/sound'

/** Icon swaps to a check with a short blur crossfade, then back. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      playSound('copy')
      setCopied(true)
    } catch {
      // Clipboard can be blocked (permissions, insecure context). The text stays selectable.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        title={label}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900/[0.05] hover:text-neutral-700"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={copied ? 'done' : 'idle'}
            initial={{ scale: 0.4, opacity: 0, filter: 'blur(4px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.4, opacity: 0, filter: 'blur(4px)' }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            className="inline-flex"
          >
            {copied ? (
              <Check aria-hidden="true" className="size-3.5 text-emerald-600" />
            ) : (
              <Copy aria-hidden="true" className="size-3.5" />
            )}
          </m.span>
        </AnimatePresence>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </>
  )
}
