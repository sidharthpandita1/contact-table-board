import { animate, m, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { FieldKey } from '../fields'
import { columnSpec } from '../lib/columns'
import { playSound } from '../lib/sound'
import type { ColumnSizing } from '../lib/useColumnSizing'

/** Movement before a press becomes a drag, so a click or double-click never nudges a width. */
const DRAG_THRESHOLD = 2
const STEP = 8
const BIG_STEP = 32
/** Two presses closer than this are one double-click sequence. */
const DOUBLE_CLICK_MS = 500

/**
 * Past a limit the column stops, but the edge keeps following the pointer with resistance, like
 * iOS scrolling past its end: the further you pull, the less it gives, never more than D px.
 */
const RUBBER_C = 0.55
const RUBBER_D = 32
const rubberBand = (x: number) => (x * RUBBER_D * RUBBER_C) / (RUBBER_D + RUBBER_C * x)
const SPRING_BACK = { type: 'spring', visualDuration: 0.2, bounce: 0 } as const

interface Gesture {
  pointerId: number
  startX: number
  startWidth: number
  dx: number
  dragging: boolean
  hitMin: boolean
  hitMax: boolean
}

interface ColumnResizerProps {
  column: FieldKey
  label: string
  headerId: string
  /** The stored width. The handle writes live values to the DOM itself during a drag. */
  width: number
  sizing: ColumnSizing
  onAnnounce: (message: string) => void
}

/**
 * The right edge of a header cell. Drag it, double-click it to fit the content (⌥ to reset), or
 * focus it and use the arrow keys: a WAI-ARIA window splitter.
 */
export function ColumnResizer({
  column,
  label,
  headerId,
  width,
  sizing,
  onAnnounce,
}: ColumnResizerProps) {
  const { min, max, width: defaultWidth } = columnSpec(column)
  const reduceMotion = useReducedMotion()
  const overshoot = useMotionValue(0)
  const [dragging, setDragging] = useState(false)
  const [guideHeight, setGuideHeight] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const gesture = useRef<Gesture | null>(null)
  const frame = useRef(0)
  const lastPress = useRef({ at: 0, dragged: false })
  const widthOnFocus = useRef(width)

  // If the table goes away mid-drag (say the board is shown), don't leave the page locked.
  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current)
      delete document.documentElement.dataset.colResizing
    },
    [],
  )

  function showValue(px: number) {
    ref.current?.setAttribute('aria-valuenow', String(px))
    ref.current?.setAttribute('aria-valuetext', `${px} pixels`)
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    e.preventDefault() // no text selection, and no focus ring from a mouse press
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const now = e.timeStamp
    if (now - lastPress.current.at > DOUBLE_CLICK_MS) lastPress.current.dragged = false
    lastPress.current.at = now
    gesture.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startWidth: 0,
      dx: 0,
      dragging: false,
      hitMin: false,
      hitMax: false,
    }
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const g = gesture.current
    if (!g || e.pointerId !== g.pointerId) return
    g.dx = e.clientX - g.startX
    if (!g.dragging) {
      if (Math.abs(g.dx) < DRAG_THRESHOLD) return
      startDrag(g)
    }
    // Many pointer events can arrive per frame; draw once.
    frame.current ||= requestAnimationFrame(() => {
      frame.current = 0
      if (gesture.current?.dragging) follow(gesture.current)
    })
  }

  function startDrag(g: Gesture) {
    g.dragging = true
    lastPress.current.dragged = true
    sizing.hold(column) // a drag interrupts a glide, starting from wherever it got to
    g.startWidth = sizing.shownWidth(column)
    // The guide runs from the header to the last visible row; measured once, not per move.
    const handle = ref.current
    const header = handle?.parentElement
    const table = handle?.closest('table')
    const scroller = handle?.closest<HTMLElement>('[data-table-scroller]')
    if (header && table && scroller) {
      const bottom = Math.min(
        table.getBoundingClientRect().bottom,
        scroller.getBoundingClientRect().top + scroller.clientHeight,
      )
      setGuideHeight(Math.max(0, bottom - header.getBoundingClientRect().top))
    }
    setDragging(true)
    // The pointer leaves the handle mid-drag; lock the cursor and selection page-wide.
    document.documentElement.dataset.colResizing = ''
  }

  /** 1:1 with the pointer: no easing while your hand is on it. */
  function follow(g: Gesture) {
    const raw = g.startWidth + g.dx
    const clamped = Math.min(max, Math.max(min, raw))
    const px = Math.round(clamped)
    sizing.preview(column, px)
    showValue(px)
    const over = raw - clamped
    overshoot.set(reduceMotion ? 0 : Math.sign(over) * rubberBand(Math.abs(over)))
    // One tick the first time each limit is reached in a drag, never while held there.
    if (over > 0 && !g.hitMax) {
      g.hitMax = true
      playSound('limit')
    } else if (over < 0 && !g.hitMin) {
      g.hitMin = true
      playSound('limit')
    }
  }

  function endDrag() {
    const g = gesture.current
    gesture.current = null
    cancelAnimationFrame(frame.current)
    frame.current = 0
    if (!g?.dragging) return
    follow(g) // the last pointer position may not have been drawn yet
    sizing.commit(column, sizing.shownWidth(column))
    setDragging(false)
    delete document.documentElement.dataset.colResizing
    if (reduceMotion) overshoot.set(0)
    else animate(overshoot, 0, SPRING_BACK)
  }

  function fit() {
    const px = Math.min(max, Math.max(min, sizing.measure(column)))
    playSound('fit')
    sizing.glide(column, px)
    onAnnounce(`${label} column fit to content, ${px} pixels`)
  }

  function reset() {
    playSound('fit')
    sizing.glide(column, defaultWidth)
    onAnnounce(`${label} column reset to ${defaultWidth} pixels`)
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const current = sizing.shownWidth(column)
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight': {
        e.preventDefault()
        const step = (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? BIG_STEP : STEP)
        const next = Math.min(max, Math.max(min, current + step))
        // Steps are instant: a repeated keyboard action shouldn't make you wait.
        if (next !== current) sizing.commit(column, next)
        else if (!e.repeat) playSound('limit')
        return
      }
      case 'Home':
      case 'End':
        e.preventDefault()
        sizing.glide(column, e.key === 'Home' ? min : max)
        return
      case 'Enter':
        e.preventDefault()
        fit()
        return
      case 'Escape': {
        const before = widthOnFocus.current
        // Nothing to revert: let Esc reach the details panel.
        if (current === before && width === before) return
        e.preventDefault()
        sizing.glide(column, before)
        onAnnounce(`${label} column back to ${before} pixels`)
      }
    }
  }

  return (
    <div
      ref={ref}
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-controls={headerId}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      aria-valuetext={`${width} pixels`}
      title="Drag to resize, double-click to fit"
      data-resizing={dragging}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => {
        if (lastPress.current.dragged) return
        if (e.altKey) reset()
        else fit()
      }}
      onFocus={() => {
        widthOnFocus.current = width
      }}
      onKeyDown={onKeyDown}
      className="group/resizer absolute inset-y-0 -right-1.5 z-10 w-3 cursor-col-resize touch-none outline-none pointer-coarse:-right-3 pointer-coarse:w-6"
    >
      <m.span
        aria-hidden="true"
        style={{ x: overshoot }}
        className="pointer-events-none absolute inset-y-0 left-1/2 -ml-px w-0.5"
      >
        {/* In the header: grey on hover (after a beat, so sweeping past doesn't flicker), blue
            while dragging or focused. Always faintly there where nothing can hover. */}
        <span className="absolute inset-0 rounded-full bg-neutral-400/60 opacity-0 transition-[opacity,background-color,box-shadow] duration-120 ease-out group-hover/resizer:opacity-100 group-hover/resizer:delay-40 group-focus-visible/resizer:bg-blue-600 group-focus-visible/resizer:opacity-100 group-focus-visible/resizer:shadow-[0_0_0_3px_oklch(0.55_0.2_260/0.2)] group-data-[resizing=true]/resizer:bg-blue-600 group-data-[resizing=true]/resizer:opacity-100 group-data-[resizing=true]/resizer:delay-0 group-data-[resizing=true]/resizer:duration-0 [@media(hover:none)]:opacity-100" />
        {/* Down the table while dragging, so you can see what the edge lines up with. */}
        <span
          style={{ height: guideHeight }}
          className="absolute inset-x-0 top-0 rounded-full bg-blue-600 opacity-0 transition-opacity duration-160 ease-out group-data-[resizing=true]/resizer:opacity-100 group-data-[resizing=true]/resizer:duration-0"
        />
      </m.span>
    </div>
  )
}
