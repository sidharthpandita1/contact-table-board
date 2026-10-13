import type { Contact } from '../types'

/**
 * Ten fictional contacts. Each row deliberately exercises one layout or data edge case
 * (noted in the trailing comment). No one starts in Qualified, so the board always
 * opens with one empty group.
 */
export const seedContacts: Contact[] = [
  {
    id: 'c01',
    name: 'Priya Menon',
    email: 'priya.menon@apexhealth.example',
    company: 'Apex Health',
    role: 'CTO',
    owner: 'Ravi Nair',
    labels: ['Enterprise', 'Referral'],
    stage: 'Customer',
    notes:
      'Signed the annual plan in March. Wants a roadmap review every quarter; the next one is booked for the first week of January. Prefers email over calls and copies her chief of staff on anything contractual.',
  }, // long notes
  {
    id: 'c02',
    name: 'Tomás Herrera-Quintanilla de la Vega',
    email: 'tomas@lumenrobotics.example',
    company: 'Lumen Robotics',
    role: 'Head of Platform Engineering',
    owner: 'Sam Lee',
    labels: ['Inbound', 'Engineering'],
    stage: 'Lead',
    notes: 'Downloaded the integration guide. No reply to the follow-up yet.',
  }, // very long name, accented characters
  {
    id: 'c03',
    name: 'Siobhán O’Brien',
    email: 'siobhan.obrien+consulting@example.com',
    owner: 'Jess Park',
    labels: ['Conference'],
    stage: 'Prospect',
    notes: 'Independent consultant met at Design Systems Week. Advises two of our target accounts.',
  }, // no company, no role, plus-tagged email
  {
    id: 'c04',
    name: 'Kenji Watanabe',
    company: 'Northwind Freight',
    role: 'Operations Lead',
    owner: 'Sam Lee',
    labels: ['SMB'],
    stage: 'Lead',
    notes: 'Reached him through the main line. Still need a direct email.',
  }, // no email
  {
    id: 'c05',
    name: 'Amara Okafor',
    email: 'amara@brightline.example',
    company: 'Brightline Studio',
    role: 'Founder',
    labels: ['Partner', 'Design'],
    stage: 'Customer',
    notes: 'Agency partner. Refers two or three clients a quarter.',
  }, // no owner
  {
    id: 'c06',
    name: 'Lukas Bergström',
    email: 'lukas.bergstrom@fjord.example',
    company: 'Fjord Analytics',
    role: 'Data Platform Lead',
    owner: 'Ravi Nair',
    labels: ['Enterprise', 'Inbound', 'Engineering', 'Conference', 'Partner'],
    stage: 'Prospect',
    notes: 'Comparing us with an in-house build. Security review requested.',
  }, // five labels, overflow chip
  {
    id: 'c07',
    name: 'Mei-Ling Chen',
    email: 'meiling.chen@harborcapital.example',
    company: 'Harbor Capital Partners International Holdings',
    role: 'Associate',
    owner: 'Jess Park',
    labels: ['Referral'],
    stage: 'Lead',
    notes: 'Intro from Priya Menon.',
  }, // very long company
  {
    id: 'c08',
    name: 'Dmitri Volkov',
    email: 'd.volkov@sableandfinch.example',
    company: 'Sable & Finch',
    role: 'Procurement Manager',
    owner: 'Sam Lee',
    labels: [],
    stage: 'Customer',
    notes: 'Renewal due in November. Wants consolidated invoicing.',
  }, // no labels
  {
    id: 'c09',
    name: 'Fatima Al-Sayed',
    email: 'fatima.alsayed@orielbio.example',
    company: 'Oriel Biotech',
    role: 'VP Research',
    owner: 'Ravi Nair',
    labels: ['Enterprise'],
    stage: 'Prospect',
    notes: '',
  }, // empty notes
  {
    id: 'c10',
    name: 'Noah Whitfield',
    email: 'noah.w@kestrel.example',
    company: 'Kestrel Logistics',
    labels: [],
    stage: 'Lead',
    notes: 'Asked for pricing for a five-seat team.',
  }, // sparse: no role, no owner, no labels
]
