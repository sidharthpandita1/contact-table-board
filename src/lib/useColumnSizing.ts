import { animate, useReducedMotion, type AnimationPlaybackControls } from 'motion/react'
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import type { FieldKey } from '../fields'
import {
  COLUMNS,
  clampWidth,
  getColumnWidths,
  setColumnWidth,
  useColumnWidths,
  type ColumnWidths,
} from './columns'
import { EASE_OUT } from './motion'

/**
 * Fit, reset and Home/End glide to their width. A tween, not a spring: it's a layout change
 * with no hand on it, so it should land exactly, on time, with every column in a reset
 * finishing together. A drag can still take over midway.
 */
const GLIDE = { duration: 0.24, ease: EASE_OUT }

export const columnVar = (key: FieldKey) => `--col-${key}`

/** The table is as wide as its columns, and never narrower than its container. */
export const TABLE_WIDTH = `max(calc(${COLUMNS.map((c) => `var(${columnVar(c.key)})`).join(' + ')}), 100%)`

/**
 * Column widths live in CSS custom properties on the <table>, written straight to the DOM, so
 * a drag costs no React render per frame; the store only hears the result.
 *
 * One rule keeps the screen and the store in step: anything that writes the DOM first (a drag,
 * an arrow key) is direct, and anything that only changes the store (fit, reset, Home/End,
 * Escape) animates there.
 */
export function useColumnSizing() {
  const widths = useColumnWidths()
  const reduceMotion = useReducedMotion()
  const table = useRef<HTMLTableElement | null>(null)
  const shown = useRef<ColumnWidths>({ ...widths })
  const running = useRef<Partial<Record<FieldKey, AnimationPlaybackControls>>>({})

  const write = useCallback((key: FieldKey, px: number) => {
    shown.current[key] = px
    table.current?.style.setProperty(columnVar(key), `${px}px`)
  }, [])

  const hold = useCallback((key: FieldKey) => {
    running.current[key]?.stop()
    delete running.current[key]
  }, [])

  const settle = useCallback(
    (key: FieldKey, to: number) => {
      hold(key)
      const from = shown.current[key]
      if (from === to) return
      if (reduceMotion || !table.current) return write(key, to)
      running.current[key] = animate(from, to, {
        ...GLIDE,
        onUpdate: (px) => write(key, px),
        onComplete: () => delete running.current[key],
      })
    },
    [hold, write, reduceMotion],
  )

  // The table mounts (or comes back after an empty search) at the stored widths, before paint.
  const attachTable = useCallback(
    (el: HTMLTableElement | null) => {
      table.current = el
      if (!el) return
      const current = getColumnWidths()
      for (const { key } of COLUMNS) {
        hold(key)
        write(key, current[key])
      }
    },
    [hold, write],
  )

  // A stored width changed without the DOM being written first: animate to it. Columns that
  // didn't change are left alone, so one column's step never restarts another's glide.
  const stored = useRef(widths)
  useLayoutEffect(() => {
    const before = stored.current
    stored.current = widths
    for (const { key } of COLUMNS) if (widths[key] !== before[key]) settle(key, widths[key])
  }, [widths, settle])

  useEffect(() => {
    const anims = running.current
    return () => Object.values(anims).forEach((a) => a?.stop())
  }, [])

  return {
    widths,
    /** Ref callback for the <table>. */
    attachTable,
    /** What's on screen now, which mid-animation isn't the stored width. */
    shownWidth: (key: FieldKey) => Math.round(shown.current[key]),
    /** Take over from a running animation, e.g. when a drag starts. */
    hold,
    /** Draw a width without storing it: every frame of a drag. */
    preview: (key: FieldKey, px: number) => write(key, clampWidth(key, px)),
    /** Draw and store at once, no animation: the end of a drag, an arrow step. */
    commit: (key: FieldKey, px: number) => {
      hold(key)
      write(key, clampWidth(key, px))
      setColumnWidth(key, px)
    },
    /** Store a width and animate to it: fit, reset, Home/End, revert. */
    glide: (key: FieldKey, px: number) => {
      const to = clampWidth(key, px)
      if (getColumnWidths()[key] === to) settle(key, to)
      else setColumnWidth(key, to)
    },
    measure: (key: FieldKey) => measureColumn(table.current, key),
  }
}

/** What a resize handle needs: everything but the table's ref callback. */
export type ColumnSizing = Omit<ReturnType<typeof useColumnSizing>, 'attachTable'>

/**
 * The width a column needs to show everything visible in it without truncating: the header
 * label and every rendered cell, plus the cell's own padding and border. Each cell's content is
 * briefly sized to max-content; all writes, then all reads, so the column costs one layout.
 */
function measureColumn(table: HTMLTableElement | null, key: FieldKey): number {
  if (!table) return 0
  const nth = COLUMNS.findIndex((c) => c.key === key) + 1
  const cells = [...table.querySelectorAll<HTMLElement>(`tr > :nth-child(${nth})`)]
  const contents = cells.map((cell) => cell.firstElementChild as HTMLElement | null)
  contents.forEach((el) => el?.style.setProperty('width', 'max-content'))
  const needed = cells.map((cell, i) => {
    const content = contents[i]
    if (!content) return 0
    const style = getComputedStyle(cell)
    return (
      content.getBoundingClientRect().width +
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight) +
      parseFloat(style.borderRightWidth)
    )
  })
  contents.forEach((el) => el?.style.removeProperty('width'))
  return Math.ceil(Math.max(0, ...needed))
}
