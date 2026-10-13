import { Search, X } from 'lucide-react'
import type { Ref } from 'react'
import { SEARCH_ID } from '../lib/dom'
import { playSound } from '../lib/sound'
import { Kbd } from './Kbd'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

/** Press "/" anywhere to focus. Esc clears, then blurs. */
export function SearchField({ value, onChange, ref }: SearchFieldProps) {
  function clear() {
    playSound('clear')
    onChange('')
  }

  return (
    <div className="relative w-full max-w-60 min-w-36">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-neutral-400"
      />
      <input
        ref={ref}
        id={SEARCH_ID}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return
          e.preventDefault() // keep Esc from also closing the details panel
          if (value) clear()
          else e.currentTarget.blur()
        }}
        placeholder="Search contacts"
        aria-label="Search contacts"
        autoComplete="off"
        spellCheck={false}
        className="h-8 w-full rounded-lg bg-neutral-900/[0.04] pr-8 pl-8 text-[13px] text-neutral-900 transition-[background-color,box-shadow] duration-150 placeholder:text-neutral-500 hover:bg-neutral-900/[0.06] focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-hairline-strong),0_1px_2px_oklch(0_0_0/0.05)] [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clear}
            className="inline-flex size-5 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-900/[0.06] hover:text-neutral-900"
          >
            <X aria-hidden="true" className="size-3.5" />
          </button>
        ) : (
          <Kbd>/</Kbd>
        )}
      </div>
    </div>
  )
}
