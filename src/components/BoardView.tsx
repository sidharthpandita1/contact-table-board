import { useMemo } from 'react'
import { groupByStage } from '../store/contacts'
import { STAGES, type Contact, type Stage } from '../types'
import { ContactCard } from './ContactCard'
import { StageDot } from './StageBadge'

interface BoardViewProps {
  contacts: Contact[]
  selectedId: string | null
  onOpen: (id: string) => void
}

export function BoardView({ contacts, selectedId, onOpen }: BoardViewProps) {
  // Derived on every change from the one shared list. Never copied into local state.
  const groups = useMemo(() => groupByStage(contacts), [contacts])

  return (
    // No tabIndex: every card is focusable and scrolls itself into view, so the scroll
    // container does not need its own tab stop (the table does, for its unfocusable columns).
    <div role="region" aria-label="Contacts board" className="h-full overflow-auto">
      {/* Columns share the width between 224px and 320px, so four fit at 1024px and beside the
          docked panel, but never stretch into wide, hard-to-scan lanes on big monitors. */}
      <div className="flex items-start gap-3 px-6 pt-4 pb-8">
        {STAGES.map((stage) => (
          <BoardColumn
            key={stage}
            stage={stage}
            contacts={groups[stage]}
            selectedId={selectedId}
            onOpen={onOpen}
          />
        ))}
      </div>
    </div>
  )
}

interface BoardColumnProps {
  stage: Stage
  contacts: Contact[]
  selectedId: string | null
  onOpen: (id: string) => void
}

function BoardColumn({ stage, contacts, selectedId, onOpen }: BoardColumnProps) {
  const headingId = `column-${stage.toLowerCase()}`
  return (
    <section
      aria-labelledby={headingId}
      className="flex max-w-80 min-w-56 flex-[1_1_0] flex-col rounded-lg bg-neutral-100/70 p-2"
    >
      <h2
        id={headingId}
        className="flex h-7 items-center gap-2 px-1.5 text-[13px] font-medium text-neutral-800"
      >
        <StageDot stage={stage} />
        {stage}
        <span className="text-xs font-normal text-neutral-500 tabular-nums">
          {contacts.length}
          <span className="sr-only"> {contacts.length === 1 ? 'contact' : 'contacts'}</span>
        </span>
      </h2>
      {contacts.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-2">
          {contacts.map((contact) => (
            <li key={contact.id}>
              <ContactCard contact={contact} selected={contact.id === selectedId} onOpen={onOpen} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 flex min-h-20 items-center justify-center rounded-md border border-dashed border-neutral-300 px-3 text-center text-xs text-neutral-500">
          No contacts in {stage}
        </p>
      )}
    </section>
  )
}
