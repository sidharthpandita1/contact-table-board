import { createContext, useContext, useMemo, type Dispatch } from 'react'
import type { ContactPatch, Contact } from '../types'
import { selectContacts, type ContactsAction, type ContactsState } from './contacts'

export const StateContext = createContext<ContactsState | null>(null)
export const DispatchContext = createContext<Dispatch<ContactsAction> | null>(null)

export function useContactsState(): ContactsState {
  const state = useContext(StateContext)
  if (!state) throw new Error('useContactsState must be used inside <ContactsProvider>')
  return state
}

export function useContactList(): Contact[] {
  const state = useContactsState()
  return useMemo(() => selectContacts(state), [state])
}

/** The single write path. Both views and the panel go through it. */
export function useUpdateContact(): (id: string, patch: ContactPatch) => void {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useUpdateContact must be used inside <ContactsProvider>')
  return useMemo(() => (id, patch) => dispatch({ type: 'contact/updated', id, patch }), [dispatch])
}
