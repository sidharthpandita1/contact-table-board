import type { Contact, ContactPatch } from '../types'

/** Toast copy for a save. Past tense, names the record, names the new stage. */
export function describeSave(before: Contact, patch: ContactPatch): string {
  const notesChanged = patch.notes !== undefined
  if (patch.stage && notesChanged) return `Moved ${before.name} to ${patch.stage} and updated notes`
  if (patch.stage) return `Moved ${before.name} to ${patch.stage}`
  return `Updated notes for ${before.name}`
}

/** The values to restore for exactly the fields that changed. */
export function undoPatch(before: Contact, patch: ContactPatch): ContactPatch {
  const undo: ContactPatch = {}
  if (patch.stage !== undefined) undo.stage = before.stage
  if (patch.notes !== undefined) undo.notes = before.notes
  return undo
}
