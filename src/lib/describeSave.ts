import type { Contact, ContactPatch, Stage } from '../types'

export interface SaveSummary {
  /** Plain sentence for screen readers and tests. */
  text: string
  name: string
  stage?: Stage
  notesUpdated: boolean
}

/** Toast copy for a save. Past tense, names the record, names the new stage. */
export function describeSave(before: Contact, patch: ContactPatch): SaveSummary {
  const notesUpdated = patch.notes !== undefined
  const { name } = before
  const text =
    patch.stage && notesUpdated
      ? `Moved ${name} to ${patch.stage} and updated notes`
      : patch.stage
        ? `Moved ${name} to ${patch.stage}`
        : `Updated notes for ${name}`
  return { text, name, stage: patch.stage, notesUpdated }
}

/** The values to restore for exactly the fields that changed. */
export function undoPatch(before: Contact, patch: ContactPatch): ContactPatch {
  const undo: ContactPatch = {}
  if (patch.stage !== undefined) undo.stage = before.stage
  if (patch.notes !== undefined) undo.notes = before.notes
  return undo
}
