import { LazyMotion, MotionConfig, domMax } from 'motion/react'
import type { ReactNode } from 'react'
import { ContactsProvider } from './store/ContactsProvider'
import type { Contact } from './types'

/** Everything App needs around it. Shared by main.tsx and the tests. */
export function AppProviders({ contacts, children }: { contacts: Contact[]; children: ReactNode }) {
  return (
    // reducedMotion="user": with the OS setting on, movement is dropped and fades remain.
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax} strict>
        <ContactsProvider initialContacts={contacts}>{children}</ContactsProvider>
      </LazyMotion>
    </MotionConfig>
  )
}
