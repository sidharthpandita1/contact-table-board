import { useSyncExternalStore } from 'react'
import type { FieldKey } from '../fields'

export interface ColumnSpec {
  key: FieldKey
  /** Default width in px. */
  width: number
  min: number
  max: number
}

/**
 * Column order, default widths and limits (px). Name first and sticky; the two editable
 * fields bracket the row. Minimums keep a column's content recognisable; maximums stop one
 * column from pushing everything else off screen.
 */
export const COLUMNS: ColumnSpec[] = [
  { key: 'name', width: 268, min: 160, max: 560 },
  { key: 'stage', width: 136, min: 112, max: 240 },
  { key: 'company', width: 208, min: 120, max: 420 },
  { key: 'role', width: 196, min: 120, max: 420 },
  { key: 'owner', width: 148, min: 120, max: 320 },
  { key: 'labels', width: 220, min: 140, max: 480 },
  { key: 'email', width: 260, min: 160, max: 520 },
  { key: 'notes', width: 320, min: 160, max: 800 },
]

export type ColumnWidths = Record<FieldKey, number>

const SPECS = Object.fromEntries(COLUMNS.map((c) => [c.key, c])) as Record<FieldKey, ColumnSpec>

export const DEFAULT_WIDTHS = Object.fromEntries(
  COLUMNS.map((c) => [c.key, c.width]),
) as ColumnWidths

export function clampWidth(key: FieldKey, width: number): number {
  const { min, max } = SPECS[key]
  return Math.round(Math.min(max, Math.max(min, width)))
}

export function isCustomized(widths: ColumnWidths): boolean {
  return COLUMNS.some((c) => widths[c.key] !== c.width)
}

/** Bump when defaults or limits change in a way old saved widths shouldn't survive. */
const VERSION = 1
const STORAGE_KEY = 'contacts.columns'

/** Reads saved widths, ignoring anything malformed and clamping anything out of range. */
export function parseWidths(raw: string | null): ColumnWidths {
  const widths = { ...DEFAULT_WIDTHS }
  if (!raw) return widths
  try {
    const data: unknown = JSON.parse(raw)
    if (typeof data !== 'object' || data === null) return widths
    const { v, widths: saved } = data as { v?: unknown; widths?: unknown }
    if (v !== VERSION || typeof saved !== 'object' || saved === null) return widths
    for (const { key } of COLUMNS) {
      const value = (saved as Record<string, unknown>)[key]
      if (typeof value === 'number' && Number.isFinite(value)) widths[key] = clampWidth(key, value)
    }
  } catch {
    // Corrupt JSON: fall back to the defaults.
  }
  return widths
}

function read(): ColumnWidths {
  try {
    return parseWidths(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return { ...DEFAULT_WIDTHS }
  }
}

/** Only columns that differ from the default are saved, so new defaults reach everyone else. */
function persist(widths: ColumnWidths) {
  const custom = Object.fromEntries(
    COLUMNS.filter((c) => widths[c.key] !== c.width).map((c) => [c.key, widths[c.key]]),
  )
  try {
    if (Object.keys(custom).length === 0) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, widths: custom }))
  } catch {
    // Private mode or blocked storage: widths still last for this visit.
  }
}

// A module store rather than component state, so widths survive the table unmounting
// when the board is shown, with or without storage.
let widths: ColumnWidths = typeof window === 'undefined' ? DEFAULT_WIDTHS : read()
const listeners = new Set<() => void>()

function update(next: ColumnWidths) {
  widths = next
  persist(next)
  listeners.forEach((notify) => notify())
}

export function setColumnWidth(key: FieldKey, width: number): void {
  const next = clampWidth(key, width)
  if (widths[key] !== next) update({ ...widths, [key]: next })
}

export function resetColumnWidths(): void {
  update({ ...DEFAULT_WIDTHS })
}

export const getColumnWidths = () => widths

export function useColumnWidths(): ColumnWidths {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify)
      return () => listeners.delete(notify)
    },
    () => widths,
    () => DEFAULT_WIDTHS,
  )
}

export const columnSpec = (key: FieldKey) => SPECS[key]
