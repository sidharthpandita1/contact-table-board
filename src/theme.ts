import type { Stage } from './types'

/**
 * Colour is reserved for Stage, the field the board groups by. Labels stay neutral so
 * they never compete with it. Text shades are a step darker than Notion's pastels,
 * which fall below 4.5:1 contrast at 12px.
 */
export const STAGE_STYLES: Record<Stage, { chip: string; dot: string }> = {
  Lead: { chip: 'bg-stone-100 text-stone-700', dot: 'bg-stone-400' },
  Prospect: { chip: 'bg-sky-50 text-sky-800', dot: 'bg-sky-500' },
  Qualified: { chip: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  Customer: { chip: 'bg-emerald-50 text-emerald-800', dot: 'bg-emerald-500' },
}

/**
 * Owners are a small known team, so each gets a fixed tint and reads the same everywhere.
 * In a real product this would come from the user's profile; unknown names fall back to neutral.
 */
const TEAM_TINTS: Record<string, string> = {
  'Sam Lee': 'bg-violet-100 text-violet-800',
  'Ravi Nair': 'bg-teal-100 text-teal-800',
  'Jess Park': 'bg-rose-100 text-rose-800',
}

export function ownerTint(owner: string): string {
  return TEAM_TINTS[owner] ?? 'bg-neutral-200 text-neutral-700'
}
