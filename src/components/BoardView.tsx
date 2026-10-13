import { useDroppable } from '@dnd-kit/react'
import { Inbox, SearchX } from 'lucide-react'
import { LayoutGroup, m } from 'motion/react'
import { useMemo, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import { TRAVEL } from '../lib/motion'
import { groupByStage } from '../store/contacts'
import { STAGES, type Contact, type Stage } from '../types'
import { BoardDnd } from './BoardDnd'
import { ContactCard } from './ContactCard'
import { Kbd } from './Kbd'
import { RollingNumber } from './RollingNumber'
import { StageBadge } from './StageBadge'

interface BoardViewProps {
  contacts: Contact[]
  selectedId: string | null
  /** Card that was just dropped: it skips the shared-layout flight, since the drag already moved it. */
  droppedId: string | null
  dragDisabledId: string | null
  filtering: boolean
  onOpen: (id: string) => void
  onMove: (id: string, stage: Stage, via: 'drag') => void
  onCardKeyDown: (e: KeyboardEvent, contact: Contact) => void
}

export function BoardView(props: BoardViewProps) {
  const { contacts, onMove } = props
  // Derived on every change from the one shared list. Never copied into local state.
  const groups = useMemo(() => groupByStage(contacts), [contacts])

  return (
    <BoardDnd onMove={(id, stage) => onMove(id, stage, 'drag')}>
      {/* No tabIndex: every card is focusable and scrolls itself into view. */}
      <m.div
        layoutScroll
        role="region"
        aria-label="Contacts board"
        className="h-full overflow-auto"
      >
        <LayoutGroup id="board">
          {/* Columns share the width between 224px and 320px, so four fit at 1024px and beside
              the docked panel, but never stretch into wide lanes on big monitors. */}
          <div className="flex min-h-full items-stretch gap-3 px-5 pt-4 pb-6">
            {STAGES.map((stage) => (
              <BoardColumn key={stage} {...props} stage={stage} contacts={groups[stage]} />
            ))}
          </div>
        </LayoutGroup>
      </m.div>
    </BoardDnd>
  )
}

type BoardColumnProps = BoardViewProps & { stage: Stage }

function BoardColumn({
  stage,
  contacts,
  selectedId,
  droppedId,
  dragDisabledId,
  filtering,
  onOpen,
  onCardKeyDown,
}: BoardColumnProps) {
  const { ref, isDropTarget } = useDroppable({ id: stage, accept: 'card' })
  const headingId = `column-${stage.toLowerCase()}`

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      data-tone={stage}
      data-drop-over={isDropTarget}
      className="flex max-w-80 min-w-56 flex-[1_1_0] flex-col rounded-xl bg-neutral-900/[0.025] p-1.5 transition-[background-color,box-shadow] duration-150"
    >
      <h2 id={headingId} className="flex h-8 items-center gap-2 px-1.5 pb-1">
        <StageBadge stage={stage} />
        <RollingNumber
          value={contacts.length}
          className="text-[12.5px] font-medium text-neutral-500"
        />
        <span className="sr-only">
          {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
        </span>
      </h2>
      {contacts.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {contacts.map((contact) => (
            <m.li
              key={contact.id}
              layout="position"
              layoutId={contact.id === droppedId ? undefined : `card-${contact.id}`}
              transition={TRAVEL}
              initial={contact.id === droppedId ? { scale: 1.03 } : false}
              animate={{ scale: 1 }}
              className="relative"
            >
              <ContactCard
                contact={contact}
                selected={contact.id === selectedId}
                dragDisabled={contact.id === dragDisabledId}
                onOpen={onOpen}
                onKeyDown={onCardKeyDown}
              />
            </m.li>
          ))}
        </ul>
      ) : (
        <ColumnEmpty stage={stage} filtering={filtering} over={isDropTarget} />
      )}
    </section>
  )
}

function ColumnEmpty({
  stage,
  filtering,
  over,
}: {
  stage: Stage
  filtering: boolean
  over: boolean
}) {
  const Icon = filtering ? SearchX : Inbox
  return (
    <div
      className={cn(
        'flex min-h-32 flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed px-4 py-6 text-center transition-colors duration-150',
        over ? 'border-transparent' : 'border-neutral-300',
      )}
    >
      <Icon aria-hidden="true" className="mb-1 size-4 text-neutral-400" />
      <p className="text-[13px] font-medium text-neutral-700">
        {filtering ? 'No matches' : `No ${stage.toLowerCase()} contacts`}
      </p>
      {!filtering && (
        <p className="text-xs leading-5 text-neutral-500">
          Drag a card here, or focus one and press <Kbd>⌥</Kbd> <Kbd>⇧</Kbd> <Kbd>→</Kbd>
          <span className="sr-only">Alt, Shift and an arrow key</span>
        </p>
      )}
    </div>
  )
}
