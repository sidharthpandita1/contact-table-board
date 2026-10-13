import { PanelRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { FIELDS, type FieldKey } from '../fields'
import { cn } from '../lib/cn'
import { PANEL_ID, openButtonId } from '../lib/dom'
import { ownerTint } from '../theme'
import type { Contact } from '../types'
import { Avatar } from './Avatar'
import { EmptyValue } from './EmptyValue'
import { LabelList } from './LabelList'
import { StageBadge } from './StageBadge'

/** Column order and fixed widths (px). Name first and sticky; the two editable fields bracket the row. */
const COLUMNS: { key: FieldKey; width: number }[] = [
  { key: 'name', width: 256 },
  { key: 'stage', width: 128 },
  { key: 'company', width: 184 },
  { key: 'role', width: 184 },
  { key: 'owner', width: 140 },
  { key: 'labels', width: 208 },
  { key: 'email', width: 248 },
  { key: 'notes', width: 300 },
]
const TABLE_WIDTH = COLUMNS.reduce((sum, c) => sum + c.width, 0)

interface TableViewProps {
  contacts: Contact[]
  selectedId: string | null
  onOpen: (id: string) => void
}

export function TableView({ contacts, selectedId, onOpen }: TableViewProps) {
  return (
    <div
      role="region"
      aria-label="Contacts table"
      tabIndex={0}
      className="h-full overflow-auto focus-visible:-outline-offset-2"
    >
      <table
        className="table-fixed border-separate border-spacing-0 text-[13px]"
        style={{ width: `max(${TABLE_WIDTH}px, 100%)` }}
      >
        <caption className="sr-only">Contacts. Select a name to open its details.</caption>
        <colgroup>
          {COLUMNS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
          <col />
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(({ key }) => {
              const { label, icon: Icon } = FIELDS[key]
              return (
                <th
                  key={key}
                  scope="col"
                  className={cn(
                    'sticky top-0 z-20 h-8 border-b border-neutral-200 bg-white px-3 text-left text-xs font-normal text-neutral-500',
                    key === 'name' && 'left-0 z-30 border-r border-r-neutral-100 pl-6',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon aria-hidden="true" className="size-3.5 text-neutral-400" />
                    {label}
                  </span>
                </th>
              )
            })}
            <th
              aria-hidden="true"
              className="sticky top-0 z-20 border-b border-neutral-200 bg-white"
            />
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <ContactRow
              key={contact.id}
              contact={contact}
              selected={contact.id === selectedId}
              onOpen={onOpen}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ContactRowProps {
  contact: Contact
  selected: boolean
  onOpen: (id: string) => void
}

function ContactRow({ contact, selected, onOpen }: ContactRowProps) {
  const { id, name, stage, company, role, owner, labels, email, notes } = contact

  // The whole row is a mouse target; the Name button is the keyboard and screen reader path.
  function onRowClick() {
    if (window.getSelection()?.toString()) return // let people select and copy text
    onOpen(id)
  }

  return (
    <tr
      data-record-id={id}
      data-selected={selected}
      onClick={onRowClick}
      className="group cursor-default bg-white hover:bg-neutral-50 data-[selected=true]:bg-blue-50"
    >
      <td className="sticky left-0 z-10 h-9 border-r border-b border-r-neutral-100 border-b-neutral-200 bg-inherit pr-2 pl-6 group-data-[selected=true]:shadow-[inset_3px_0_0_var(--color-blue-600)]">
        <div className="flex items-center gap-2">
          <Avatar name={name} />
          <button
            type="button"
            id={openButtonId(id)}
            aria-expanded={selected}
            aria-controls={selected ? PANEL_ID : undefined}
            onClick={(e) => {
              e.stopPropagation()
              onOpen(id)
            }}
            title={name}
            className="min-w-0 truncate rounded-sm text-left font-medium text-neutral-900"
          >
            {name}
          </button>
          <span
            aria-hidden="true"
            className="ml-auto hidden shrink-0 items-center gap-1 rounded border border-neutral-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-neutral-500 shadow-xs group-hover:inline-flex"
          >
            <PanelRight className="size-3" />
            Open
          </span>
        </div>
      </td>
      <Cell>
        <StageBadge stage={stage} />
      </Cell>
      <TextCell value={company} empty="No company" />
      <TextCell value={role} empty="No role" />
      <Cell>
        {owner ? (
          <span className="flex min-w-0 items-center gap-1.5" title={owner}>
            <Avatar name={owner} tint={ownerTint(owner)} />
            <span className="truncate">{owner}</span>
          </span>
        ) : (
          <EmptyValue label="No owner" />
        )}
      </Cell>
      <Cell>
        <LabelList labels={labels} max={2} />
      </Cell>
      <TextCell value={email} empty="No email" className="text-neutral-700" />
      <TextCell value={notes} empty="No notes" className="text-neutral-500" />
      <td aria-hidden="true" className="border-b border-neutral-200" />
    </tr>
  )
}

function Cell({ children }: { children: ReactNode }) {
  return (
    <td className="h-9 overflow-hidden border-b border-neutral-200 px-3 whitespace-nowrap">
      {children}
    </td>
  )
}

function TextCell({
  value,
  empty,
  className,
}: {
  value?: string
  empty: string
  className?: string
}) {
  return (
    <Cell>
      {value ? (
        <div className={cn('truncate', className)} title={value}>
          {value}
        </div>
      ) : (
        <EmptyValue label={empty} />
      )}
    </Cell>
  )
}
