import { AnimatePresence, m, type Variants } from 'motion/react'
import { useState } from 'react'

const variants: Variants = {
  enter: (dir: number) => ({ y: dir > 0 ? '75%' : '-75%', opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: number) => ({ y: dir > 0 ? '-75%' : '75%', opacity: 0 }),
}

/**
 * A count that rolls to its new value: up when it grows, down when it shrinks.
 * Hidden from screen readers; the caller supplies the accessible text.
 */
export function RollingNumber({ value, className }: { value: number; className?: string }) {
  // Remember the previous value during render (react.dev "storing information from previous renders").
  const [prev, setPrev] = useState(value)
  const [dir, setDir] = useState(1)
  if (value !== prev) {
    setDir(value > prev ? 1 : -1)
    setPrev(value)
  }

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ''}`}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <m.span
          key={value}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', visualDuration: 0.32, bounce: 0 }}
        >
          {value}
        </m.span>
      </AnimatePresence>
    </span>
  )
}
