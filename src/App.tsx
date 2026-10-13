import { Users } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { flushSync } from 'react-dom'
import { BoardView } from './components/BoardView'
import { DetailsPanel, Scrim, type PanelPosition } from './components/DetailsPanel'
import { OwnerFilter } from './components/OwnerFilter'
import { PipelineBar } from './components/PipelineBar'
import { SearchField } from './components/SearchField'
import { TableView } from './components/TableView'
import { Toast, type ToastMessage } from './components/Toast'
import { ViewSwitcher } from './components/ViewSwitcher'
import { describeSave, undoPatch } from './lib/describeSave'
import { VIEW_PANEL_ID, flashRecord, focusById, isEditable, openButtonId, tabId } from './lib/dom'
import {
  EMPTY_FILTER,
  isFiltering,
  matchesFilter,
  ownerOptions,
  type ContactFilter,
} from './lib/filter'
import { EASE_OUT } from './lib/motion'
import { useDetailsPanel } from './lib/useDetailsPanel'
import { useMediaQuery } from './lib/useMediaQuery'
import { useViewParam } from './lib/useViewParam'
import { groupByStage } from './store/contacts'
import { useContactList, useContactsState, useUpdateContact } from './store/hooks'
import { STAGES, type Contact, type ContactPatch, type Stage } from './types'

/** At this width and above the panel docks beside the view; below it, it overlays. */
const DOCK_QUERY = '(min-width: 1280px)'

export default function App() {
  const { byId } = useContactsState()
  const allContacts = useContactList()
  const updateContact = useUpdateContact()
  const [view, setView] = useViewParam()
  const docked = useMediaQuery(DOCK_QUERY)
  const [filter, setFilter] = useState<ContactFilter>(EMPTY_FILTER)
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const [droppedId, setDroppedId] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Everything below is derived from the one store. Nothing is copied into view state.
  const contacts = useMemo(
    () => allContacts.filter((c) => matchesFilter(c, filter)),
    [allContacts, filter],
  )
  const groups = useMemo(() => groupByStage(contacts), [contacts])
  const stageCounts = useMemo(
    () => Object.fromEntries(STAGES.map((s) => [s, groups[s].length])) as Record<Stage, number>,
    [groups],
  )
  const owners = useMemo(() => ownerOptions(allContacts), [allContacts])
  const filtering = isFiltering(filter)

  const showToast = useCallback((before: Contact, patch: ContactPatch) => {
    setToast({
      key: Date.now(),
      ...describeSave(before, patch),
      contactId: before.id,
      undo: undoPatch(before, patch),
    })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  const panel = useDetailsPanel(byId, { onSaved: showToast })
  const openId = panel.contact?.id ?? null

  // The open record with an unsaved stage edit can't be moved by drag or shortcut:
  // a later Save would silently overwrite the move.
  const lockedId =
    panel.contact && panel.draft.stage !== undefined && panel.draft.stage !== panel.contact.stage
      ? panel.contact.id
      : null

  /** One commit path for drag-and-drop and Alt+Shift+Arrow: immediate, highlighted, undoable. */
  function moveContact(id: string, stage: Stage, via: 'drag' | 'keyboard') {
    const before = byId[id]
    if (!before || before.stage === stage || id === lockedId) return
    const hadFocus = !!document.activeElement?.closest(`[data-record-id="${CSS.escape(id)}"]`)
    const patch = { stage }
    flushSync(() => {
      updateContact(id, patch)
      setDroppedId(via === 'drag' ? id : null)
    })
    if (hadFocus) focusById(openButtonId(id))
    flashRecord(id)
    showToast(before, patch)
  }

  // The dropped card skips one shared-layout flight; afterwards it travels normally again.
  useEffect(() => {
    if (!droppedId) return
    const timer = window.setTimeout(() => setDroppedId(null), 60)
    return () => window.clearTimeout(timer)
  }, [droppedId])

  function onCardKeyDown(e: KeyboardEvent, contact: Contact) {
    if (!e.altKey || !e.shiftKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return
    e.preventDefault()
    const next = STAGES[STAGES.indexOf(contact.stage) + (e.key === 'ArrowRight' ? 1 : -1)]
    if (next) moveContact(contact.id, next, 'keyboard')
  }

  function undo({ contactId, undo }: ToastMessage) {
    flushSync(() => {
      updateContact(contactId, undo)
      setToast(null)
    })
    // The Undo button just unmounted; put focus on the record it changed.
    focusById(openButtonId(contactId))
    flashRecord(contactId)
  }

  const onGlobalKeyDown = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if (e.defaultPrevented || isEditable(e.target)) return
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      searchRef.current?.focus()
    } else if (e.key === 'z' && (e.metaKey || e.ctrlKey) && !e.shiftKey && toast) {
      e.preventDefault()
      undo(toast)
    }
  })
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onGlobalKeyDown(e)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Paging follows what's on screen: table order, or column by column on the board.
  const ordered = view === 'board' ? STAGES.flatMap((s) => groups[s]) : contacts
  const index = ordered.findIndex((c) => c.id === openId)
  const position: PanelPosition = {
    index,
    total: ordered.length,
    prevId: index > 0 ? ordered[index - 1].id : null,
    nextId: index >= 0 && index < ordered.length - 1 ? ordered[index + 1].id : null,
  }

  const overlayOpen = panel.contact !== null && !docked
  const clearFilters = () => setFilter(EMPTY_FILTER)

  return (
    <div className="flex h-full p-2">
      {/* While the overlay drawer is open, everything behind it is inert. `isolate` keeps the
          toast inside this card's stacking context, under the scrim. */}
      <div
        className="@container relative isolate flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] bg-white shadow-panel"
        inert={overlayOpen}
      >
        <header className="flex items-center justify-between gap-4 px-5 pt-4 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-[inset_0_1px_0_oklch(1_0_0/0.15)]">
              <Users aria-hidden="true" className="size-4" />
            </span>
            <h1 className="text-[15px] font-semibold tracking-[-0.01em] text-neutral-900">
              Contacts
            </h1>
            <span className="inline-flex h-5 items-center rounded-full bg-neutral-900/[0.05] px-2 text-xs font-medium text-neutral-600 tabular-nums">
              {filtering ? `${contacts.length} of ${allContacts.length}` : allContacts.length}
            </span>
          </div>
          <PipelineBar counts={stageCounts} />
        </header>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-hairline px-5 pb-3">
          <ViewSwitcher value={view} onChange={setView} />
          <span aria-hidden="true" className="h-5 w-px bg-hairline-strong" />
          <OwnerFilter
            options={owners}
            selected={filter.owners}
            onChange={(owners) => setFilter((f) => ({ ...f, owners }))}
          />
          <div className="ml-auto flex min-w-36 flex-1 justify-end">
            <SearchField
              ref={searchRef}
              value={filter.query}
              onChange={(query) => setFilter((f) => ({ ...f, query }))}
            />
          </div>
        </div>

        <main
          id={VIEW_PANEL_ID}
          role="tabpanel"
          tabIndex={-1}
          aria-labelledby={tabId(view)}
          className="relative min-h-0 flex-1 focus-visible:-outline-offset-2"
        >
          {/* Only the incoming view animates; an exit would keep both mounted and duplicate ids. */}
          <m.div
            key={view}
            className="h-full"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
          >
            {view === 'table' ? (
              <TableView
                contacts={contacts}
                selectedId={openId}
                onOpen={panel.open}
                onCardKeyDown={onCardKeyDown}
                onClearFilters={clearFilters}
              />
            ) : (
              <BoardView
                contacts={contacts}
                selectedId={openId}
                droppedId={droppedId}
                dragDisabledId={lockedId}
                filtering={filtering}
                onOpen={panel.open}
                onMove={moveContact}
                onCardKeyDown={onCardKeyDown}
              />
            )}
          </m.div>
        </main>

        <Toast toast={toast} onUndo={undo} onDismiss={dismissToast} />
      </div>

      <AnimatePresence>
        {panel.contact && docked && (
          <DetailsPanel
            key="panel"
            contact={panel.contact}
            panel={panel}
            mode="docked"
            position={position}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {panel.contact && !docked && <Scrim key="scrim" onClick={panel.requestClose} />}
        {panel.contact && !docked && (
          <DetailsPanel
            key="panel"
            contact={panel.contact}
            panel={panel}
            mode="overlay"
            position={position}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
