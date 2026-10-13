import { describe, expect, it } from 'vitest'
import { seedContacts } from '../data/contacts'
import { changedFields } from '../lib/useDetailsPanel'
import { contactsReducer, createState, groupByStage, selectContacts } from './contacts'

const initial = createState(seedContacts)

describe('contactsReducer', () => {
  it('updates only the target record and keeps every other reference', () => {
    const next = contactsReducer(initial, {
      type: 'contact/updated',
      id: 'c04',
      patch: { stage: 'Qualified' },
    })
    expect(next.byId.c04.stage).toBe('Qualified')
    expect(next.byId.c04.notes).toBe(initial.byId.c04.notes)
    expect(next.byId.c01).toBe(initial.byId.c01)
    expect(next.order).toBe(initial.order)
    expect(initial.byId.c04.stage).toBe('Lead') // no mutation
  })

  it('ignores unknown ids without changing state', () => {
    const next = contactsReducer(initial, {
      type: 'contact/updated',
      id: 'missing',
      patch: { notes: 'x' },
    })
    expect(next).toBe(initial)
  })

  it('never duplicates or drops a record across repeated stage changes', () => {
    let state = initial
    for (const stage of ['Prospect', 'Qualified', 'Customer', 'Lead', 'Qualified'] as const) {
      state = contactsReducer(state, { type: 'contact/updated', id: 'c01', patch: { stage } })
    }
    const groups = groupByStage(selectContacts(state))
    const all = Object.values(groups).flat()
    expect(all).toHaveLength(seedContacts.length)
    expect(all.filter((c) => c.id === 'c01')).toHaveLength(1)
    expect(groups.Qualified.map((c) => c.id)).toEqual(['c01'])
  })
})

describe('groupByStage', () => {
  it('returns every stage in pipeline order, including empty ones', () => {
    const groups = groupByStage(seedContacts)
    expect(Object.keys(groups)).toEqual(['Lead', 'Prospect', 'Qualified', 'Customer'])
    expect(groups.Qualified).toEqual([])
  })
})

describe('changedFields', () => {
  const kenji = initial.byId.c04

  it('returns only fields that differ from the live record', () => {
    expect(changedFields(kenji, { stage: 'Qualified', notes: kenji.notes })).toEqual({
      stage: 'Qualified',
    })
  })

  it('treats an edit changed back to the original value as no change', () => {
    expect(changedFields(kenji, { stage: 'Lead' })).toEqual({})
  })
})
