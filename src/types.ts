/** Pipeline order. Board columns and the Stage select both iterate this tuple. */
export const STAGES = ['Lead', 'Prospect', 'Qualified', 'Customer'] as const
export type Stage = (typeof STAGES)[number]

export interface Contact {
  id: string
  name: string
  email?: string
  company?: string
  role?: string
  owner?: string
  labels: string[]
  stage: Stage
  notes: string
}

/** The only fields the brief allows editing. */
export type EditableField = 'stage' | 'notes'
export type ContactPatch = Partial<Pick<Contact, EditableField>>

export type ViewMode = 'table' | 'board'

export function isStage(value: string): value is Stage {
  return (STAGES as readonly string[]).includes(value)
}
