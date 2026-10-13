import { useReducer, type ReactNode } from 'react'
import type { Contact } from '../types'
import { contactsReducer, createState } from './contacts'
import { DispatchContext, StateContext } from './hooks'

export function ContactsProvider({
  initialContacts,
  children,
}: {
  initialContacts: Contact[]
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(contactsReducer, initialContacts, createState)
  return (
    <StateContext value={state}>
      <DispatchContext value={dispatch}>{children}</DispatchContext>
    </StateContext>
  )
}
