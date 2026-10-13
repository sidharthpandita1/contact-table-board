import { useCallback, useState } from 'react'
import { BoardView } from './components/BoardView'
import { DetailsPanel } from './components/DetailsPanel'
import { TableView } from './components/TableView'
import { Toast, type ToastMessage } from './components/Toast'
import { ViewSwitcher } from './components/ViewSwitcher'
import { describeSave, undoPatch } from './lib/describeSave'
import { VIEW_PANEL_ID, flashRecord, focusById, openButtonId, tabId } from './lib/dom'
import { useDetailsPanel } from './lib/useDetailsPanel'
import { useMediaQuery } from './lib/useMediaQuery'
import { useViewParam } from './lib/useViewParam'
import { useContactList, useContactsState, useUpdateContact } from './store/hooks'

/** At this width and above the panel docks beside the view; below it, it overlays. */
const DOCK_QUERY = '(min-width: 1280px)'

export default function App() {
  const { byId } = useContactsState()
  const contacts = useContactList()
  const updateContact = useUpdateContact()
  const [view, setView] = useViewParam()
  const docked = useMediaQuery(DOCK_QUERY)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const panel = useDetailsPanel(byId, {
    onSaved: (before, patch) =>
      setToast({
        key: Date.now(),
        text: describeSave(before, patch),
        contactId: before.id,
        undo: undoPatch(before, patch),
      }),
  })

  const dismissToast = useCallback(() => setToast(null), [])

  function undo({ contactId, undo }: ToastMessage) {
    updateContact(contactId, undo)
    setToast(null)
    // The toast button is about to unmount; put focus somewhere meaningful.
    requestAnimationFrame(() => {
      focusById(openButtonId(contactId))
      flashRecord(contactId)
    })
  }

  const selectedId = panel.contact?.id ?? null
  const overlayOpen = panel.contact !== null && !docked

  return (
    <div className="flex h-full">
      {/* While the overlay drawer is open, everything behind it is inert. */}
      <div className="flex min-w-0 flex-1 flex-col" inert={overlayOpen}>
        <header className="px-6 pt-7 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Contacts</h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Team pipeline. Open anyone to update their stage or notes.
          </p>
        </header>

        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 pb-2">
          <ViewSwitcher value={view} onChange={setView} />
          <p className="text-xs text-neutral-500 tabular-nums">{contacts.length} contacts</p>
        </div>

        <main
          id={VIEW_PANEL_ID}
          role="tabpanel"
          aria-labelledby={tabId(view)}
          className="min-h-0 flex-1"
        >
          {view === 'table' ? (
            <TableView contacts={contacts} selectedId={selectedId} onOpen={panel.open} />
          ) : (
            <BoardView contacts={contacts} selectedId={selectedId} onOpen={panel.open} />
          )}
        </main>
      </div>

      {panel.contact && (
        <>
          {!docked && (
            <div
              aria-hidden="true"
              onClick={panel.requestClose}
              className="fixed inset-0 z-40 bg-neutral-900/20 transition-opacity duration-200 starting:opacity-0"
            />
          )}
          <DetailsPanel
            contact={panel.contact}
            panel={panel}
            mode={docked ? 'docked' : 'overlay'}
          />
        </>
      )}

      <Toast toast={toast} onUndo={undo} onDismiss={dismissToast} />
    </div>
  )
}
