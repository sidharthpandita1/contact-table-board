import { describe, expect, it } from 'vitest'
import { seedContacts } from '../data/contacts'
import { UNASSIGNED, matchesFilter, normalize, ownerOptions } from './filter'

describe('filter', () => {
  it('normalizes case and accents', () => {
    expect(normalize('Tomás Bergström')).toBe('tomas bergstrom')
  })

  it('matches across name, company, labels and notes', () => {
    const priya = seedContacts[0]
    for (const query of ['priya', 'APEX', 'referral', 'roadmap']) {
      expect(matchesFilter(priya, { query, owners: [] })).toBe(true)
    }
    expect(matchesFilter(priya, { query: 'zzz', owners: [] })).toBe(false)
  })

  it('treats a missing owner as Unassigned and lists it last', () => {
    const amara = seedContacts[4]
    expect(matchesFilter(amara, { query: '', owners: [UNASSIGNED] })).toBe(true)
    expect(ownerOptions(seedContacts).at(-1)).toEqual({
      value: UNASSIGNED,
      label: 'Unassigned',
      count: 2,
    })
  })
})
