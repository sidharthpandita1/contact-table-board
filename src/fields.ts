import {
  AlignLeft,
  AtSign,
  BriefcaseBusiness,
  Building2,
  CircleDot,
  Tag,
  Type,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import type { Contact } from './types'

export type FieldKey = keyof Omit<Contact, 'id'>

/** One label and icon per field, shared by table headers and the details panel. */
export const FIELDS: Record<FieldKey, { label: string; icon: LucideIcon }> = {
  name: { label: 'Name', icon: Type },
  stage: { label: 'Stage', icon: CircleDot },
  company: { label: 'Company', icon: Building2 },
  role: { label: 'Role', icon: BriefcaseBusiness },
  owner: { label: 'Owner', icon: UserRound },
  labels: { label: 'Labels', icon: Tag },
  email: { label: 'Email', icon: AtSign },
  notes: { label: 'Notes', icon: AlignLeft },
}
