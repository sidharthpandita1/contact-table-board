import { useEffect, useEffectEvent, useState } from 'react'
import { flushSync } from 'react-dom'
import { useUpdateContact } from '../store/hooks'
import type { Contact, ContactPatch, EditableField } from '../types'
import {
  KEEP_EDITING_ID,
  PANEL_ID,
  PANEL_TITLE_ID,
  fieldId,
  flashRecord,
  focusById,
  openButtonId,
} from './dom'

/** Why the panel is asking before it throws away a draft. */
export type PendingExit = { kind: 'close' } | { kind: 'switch'; toId: string }

/** Keys in the draft whose values differ from the live record. This is what Save commits. */
export function changedFields(contact: Contact, draft: ContactPatch): ContactPatch {
  const patch: ContactPatch = {}
  if (draft.stage !== undefined && draft.stage !== contact.stage) patch.stage = draft.stage
  if (draft.notes !== undefined && draft.notes !== contact.notes) patch.notes = draft.notes
  return patch
}

interface Options {
  /** Called after a save that changed something, with the record as it was before. */
  onSaved?: (before: Contact, patch: ContactPatch) => void
}

/**
 * Owns the editing session for the shared details panel: which record is open, the
 * unsaved draft, and the "discard changes?" prompt.
 *
 * - The draft holds only edited fields. Everything else is read live from the store,
 *   so the panel can never show a stale copy.
 * - Explicit Cancel discards immediately. Implicit exits (Esc, X, scrim, opening another
 *   record) ask first when there are unsaved changes.
 * - Focus moves into the panel on open and back to the record's row or card on close.
 */
export function useDetailsPanel(byId: Record<string, Contact>, { onSaved }: Options = {}) {
  const updateContact = useUpdateContact()
  const [openId, setOpenId] = useState<string | null>(null)
  const [draft, setDraft] = useState<ContactPatch>({})
  const [pendingExit, setPendingExit] = useState<PendingExit | null>(null)
  const [lastEdited, setLastEdited] = useState<EditableField>('stage')

  const contact = openId ? (byId[openId] ?? null) : null
  const patch = contact ? changedFields(contact, draft) : {}
  const isDirty = Object.keys(patch).length > 0

  function show(id: string) {
    flushSync(() => {
      setOpenId(id)
      setDraft({})
      setPendingExit(null)
    })
    focusById(PANEL_TITLE_ID)
  }

  function hide(changes?: ContactPatch) {
    if (!contact) return
    const id = contact.id
    const active = document.activeElement
    const focusWasInPanel =
      !active || active === document.body || !!document.getElementById(PANEL_ID)?.contains(active)

    flushSync(() => {
      if (changes) updateContact(id, changes)
      setOpenId(null)
      setDraft({})
      setPendingExit(null)
    })

    // Return focus to the row or card that represents this record in whichever view is
    // showing now. If the user had already moved focus elsewhere, leave it there.
    if (focusWasInPanel) focusById(openButtonId(id))
    if (changes) {
      flashRecord(id)
      onSaved?.(contact, changes)
    }
  }

  function askFirst(exit: PendingExit) {
    flushSync(() => setPendingExit(exit))
    focusById(KEEP_EDITING_ID)
  }

  function open(id: string) {
    if (id === openId) {
      focusById(PANEL_TITLE_ID)
    } else if (isDirty) {
      askFirst({ kind: 'switch', toId: id })
    } else {
      show(id)
    }
  }

  /** Esc, the X button, and the scrim. */
  function requestClose() {
    if (!contact) return
    if (isDirty) askFirst({ kind: 'close' })
    else hide()
  }

  /** The Cancel button: an explicit "throw this away", so no second question. */
  function cancel() {
    hide()
  }

  function save() {
    hide(isDirty ? patch : undefined)
  }

  function discard() {
    if (pendingExit?.kind === 'switch') show(pendingExit.toId)
    else hide()
  }

  function keepEditing() {
    flushSync(() => setPendingExit(null))
    focusById(fieldId(lastEdited))
  }

  function setField<K extends EditableField>(field: K, value: Contact[K]) {
    setDraft((d) => ({ ...d, [field]: value }))
    setLastEdited(field)
    setPendingExit(null)
  }

  const onEscape = useEffectEvent(() => {
    if (pendingExit) keepEditing()
    else requestClose()
  })

  const isOpen = contact !== null
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return
      e.preventDefault()
      onEscape()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return {
    contact,
    draft,
    isDirty,
    pendingExit,
    pendingContact: pendingExit?.kind === 'switch' ? (byId[pendingExit.toId] ?? null) : null,
    open,
    requestClose,
    cancel,
    save,
    discard,
    keepEditing,
    setField,
  }
}

export type DetailsPanelController = ReturnType<typeof useDetailsPanel>
