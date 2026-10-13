import type { Contact } from '../types'

/** Sentinel for contacts without an owner in the owner filter. */
export const UNASSIGNED = '__unassigned__'

export interface ContactFilter {
  query: string
  /** Owner names (or UNASSIGNED). Empty means everyone. */
  owners: string[]
}

export const EMPTY_FILTER: ContactFilter = { query: '', owners: [] }

/** Case- and accent-insensitive, so "tomas" finds "Tomás". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

export function isFiltering(filter: ContactFilter): boolean {
  return filter.query.trim() !== '' || filter.owners.length > 0
}

export function matchesFilter(contact: Contact, filter: ContactFilter): boolean {
  if (filter.owners.length > 0 && !filter.owners.includes(contact.owner ?? UNASSIGNED)) return false
  const query = normalize(filter.query.trim())
  if (!query) return true
  const haystack = [
    contact.name,
    contact.company,
    contact.role,
    contact.email,
    contact.owner,
    contact.notes,
    ...contact.labels,
  ]
  return haystack.some((value) => value && normalize(value).includes(query))
}

/** Owner options in first-seen order, with counts. Unassigned last. */
export function ownerOptions(
  contacts: Contact[],
): { value: string; label: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const c of contacts) {
    const key = c.owner ?? UNASSIGNED
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort(([a], [b]) => Number(a === UNASSIGNED) - Number(b === UNASSIGNED))
    .map(([value, count]) => ({ value, label: value === UNASSIGNED ? 'Unassigned' : value, count }))
}
