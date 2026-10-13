import type { Transition } from 'motion/react'

/** Shared motion tokens so every surface moves with the same physics. */
export const EASE_OUT = [0.23, 1, 0.32, 1] as const
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const

/** Indicators and thumbs: quick, no overshoot (WWDC "start at 100% damping"). */
export const SNAPPY: Transition = { type: 'spring', visualDuration: 0.28, bounce: 0.08 }

/** Cards travelling between columns. */
export const TRAVEL: Transition = { type: 'spring', visualDuration: 0.38, bounce: 0.1 }
