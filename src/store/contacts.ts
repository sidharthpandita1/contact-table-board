import { STAGES, type Contact, type ContactPatch, type Stage } from '../types'

/**
 * One normalized store is the only copy of the data. Table and board are read-only
 * projections of it. A stage change is a field update, never a move between lists,
 * so a record cannot be duplicated or left behind in its old group.
 */
export interface ContactsState {
  byId: Record<string, Contact>
  order: string[]
}

export type ContactsAction = { type: 'contact/updated'; id: string; patch: ContactPatch }

export function createState(contacts: Contact[]): ContactsState {
  return {
    byId: Object.fromEntries(contacts.map((c) => [c.id, c])),
    order: contacts.map((c) => c.id),
  }
}

export function contactsReducer(state: ContactsState, action: ContactsAction): ContactsState {
  switch (action.type) {
    case 'contact/updated': {
      const current = state.byId[action.id]
      if (!current) return state
      return { ...state, byId: { ...state.byId, [action.id]: { ...current, ...action.patch } } }
    }
  }
}

/** Ordered list, derived. Never stored. */
export function selectContacts(state: ContactsState): Contact[] {
  return state.order.map((id) => state.byId[id])
}

/** Every stage gets a key, even when empty, so empty groups still render. */
export function groupByStage(contacts: Contact[]): Record<Stage, Contact[]> {
  const groups = Object.fromEntries(STAGES.map((s) => [s, [] as Contact[]])) as Record<
    Stage,
    Contact[]
  >
  for (const contact of contacts) groups[contact.stage].push(contact)
  return groups
}
