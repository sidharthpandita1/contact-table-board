import { PanelRight, SearchX } from 'lucide-react'
import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { FIELDS } from '../fields'
import { cn } from '../lib/cn'
import { COLUMNS } from '../lib/columns'
import { PANEL_ID, TABLE_REGION_ID, openButtonId } from '../lib/dom'
import { TABLE_WIDTH, columnVar, useColumnSizing } from '../lib/useColumnSizing'
import { ownerHue } from '../theme'
import type { Contact } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { ColumnResizer } from './ColumnResizer'
import { CompanyMark } from './CompanyMark'
import { EmptyState } from './EmptyState'
import { EmptyValue } from './EmptyValue'
import { LabelList } from './LabelList'
import { StageBadge } from './StageBadge'

/**
 * Header stacking, left to right. Each resize handle straddles its cell's right border, so a
 * header must sit above its right-hand neighbour or the neighbour would cover half the handle.
 * Name is on top; its sticky body cells (z-30) sit above every other header's guide line.
 */
const headerZ = (index: number) => (index === 0 ? 40 : 30 - index)
const headerId = (key: string) => `column-${key}`

interface TableViewProps {
  contacts: Contact[]
  selectedId: string | null
  onOpen: (id: string) => void
  onCardKeyDown: (e: KeyboardEvent, contact: Contact) => void
  onClearFilters: () => void
}

export function TableView({
  contacts,
  selectedId,
  onOpen,
  onCardKeyDown,
  onClearFilters,
}: TableViewProps) {
  // Edge shadow on the sticky Name column only once content has scrolled under it.
  const [scrolled, setScrolled] = useState(false)
  const { attachTable, ...sizing } = useColumnSizing()
  const [announcement, setAnnouncement] = useState('')

  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="No contacts match"
        hint="Try another search, or clear the owner filter."
        action={<Button onClick={onClearFilters}>Clear filters</Button>}
      />
    )
  }

  return (
    <div
      id={TABLE_REGION_ID}
      role="region"
      aria-label="Contacts table"
      tabIndex={0}
      data-table-scroller
      onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)}
      className="h-full overflow-auto focus-visible:-outline-offset-2"
    >
      <p role="status" className="sr-only">
        {announcement}
      </p>
      {/* Widths come from CSS variables the sizing hook writes; see useColumnSizing. */}
      <table
        ref={attachTable}
        data-scrolled={scrolled}
        className="group/table table-fixed border-separate border-spacing-0 text-[13px]"
        style={{ width: TABLE_WIDTH }}
      >
        <caption className="sr-only">Contacts. Select a name to open its details.</caption>
        <colgroup>
          {COLUMNS.map((c) => (
            <col key={c.key} style={{ width: `var(${columnVar(c.key)})` }} />
          ))}
          <col />
        </colgroup>
        <thead>
          <tr>
            {COLUMNS.map(({ key }, index) => {
              const { label, icon: Icon } = FIELDS[key]
              return (
                <th
                  key={key}
                  id={headerId(key)}
                  scope="col"
                  style={{ zIndex: headerZ(index) }}
                  className={cn(
                    'sticky top-0 h-9 border-r border-b border-hairline bg-white px-3 text-left text-[12.5px] font-medium text-neutral-500 duration-150 has-data-[resizing=true]:text-neutral-800',
                    key === 'name'
                      ? 'left-0 pl-5 transition-[color,box-shadow] group-data-[scrolled=true]/table:shadow-[8px_0_10px_-8px_oklch(0_0_0/0.14)]'
                      : 'transition-colors',
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon aria-hidden="true" className="size-3.5 text-neutral-400" />
                    {label}
                  </span>
                  <ColumnResizer
                    column={key}
                    label={label}
                    headerId={headerId(key)}
                    width={sizing.widths[key]}
                    sizing={sizing}
                    onAnnounce={setAnnouncement}
                  />
                </th>
              )
            })}
            <th
              aria-hidden="true"
              className="sticky top-0 z-20 border-b border-hairline bg-white"
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
              onKeyDown={onCardKeyDown}
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
  onKeyDown: (e: KeyboardEvent, contact: Contact) => void
}

function ContactRow({ contact, selected, onOpen, onKeyDown }: ContactRowProps) {
  const { id, name, stage, company, role, owner, labels, email, notes } = contact

  // The whole row is a mouse target; the Name button is the keyboard and screen reader path.
  function onRowClick() {
    if (window.getSelection()?.toString()) return // let people select and copy text
    onOpen(id)
  }

  return (
    <tr
      data-record-id={id}
      data-tone={stage}
      data-selected={selected}
      onClick={onRowClick}
      className="group bg-white transition-colors duration-100 hover:bg-neutral-50 data-[selected=true]:bg-[oklch(0.972_0.014_255)]"
    >
      <td className="sticky left-0 z-30 h-10 border-r border-b border-hairline bg-inherit pr-2 pl-5 group-data-[selected=true]:shadow-[inset_2px_0_0_var(--color-blue-600)] group-data-[scrolled=true]/table:shadow-[8px_0_10px_-8px_oklch(0_0_0/0.14)] group-data-[selected=true]:group-data-[scrolled=true]/table:shadow-[inset_2px_0_0_var(--color-blue-600),8px_0_10px_-8px_oklch(0_0_0/0.14)]">
        <div className="flex items-center gap-2.5">
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
            onKeyDown={(e) => onKeyDown(e, contact)}
            title={name}
            className="min-w-0 truncate rounded-sm text-left text-[13.5px] font-medium text-neutral-900"
          >
            {name}
          </button>
          <span
            aria-hidden="true"
            className="ml-auto hidden h-6 shrink-0 items-center gap-1 rounded-md bg-white px-1.5 text-[11.5px] font-medium text-neutral-600 shadow-[inset_0_0_0_1px_var(--color-hairline-strong),0_1px_2px_oklch(0_0_0/0.06)] group-hover:inline-flex"
          >
            <PanelRight className="size-3.5" />
            Open
          </span>
        </div>
      </td>
      <Cell>
        <StageBadge stage={stage} />
      </Cell>
      <Cell>
        {company ? (
          <span className="flex min-w-0 items-center gap-2" title={company}>
            <CompanyMark company={company} />
            <span className="truncate">{company}</span>
          </span>
        ) : (
          <EmptyValue label="No company" />
        )}
      </Cell>
      <TextCell value={role} empty="No role" />
      <Cell>
        {owner ? (
          <span className="flex min-w-0 items-center gap-2" title={owner}>
            <Avatar name={owner} size="xs" hue={ownerHue(owner)} />
            <span className="truncate">{owner}</span>
          </span>
        ) : (
          <EmptyValue label="No owner" />
        )}
      </Cell>
      <Cell>
        <LabelList labels={labels} max={2} />
      </Cell>
      <TextCell value={email} empty="No email" className="text-neutral-600" />
      <TextCell value={notes} empty="No notes" className="text-neutral-500" />
      <td aria-hidden="true" className="border-b border-hairline" />
    </tr>
  )
}

function Cell({ children }: { children: ReactNode }) {
  return (
    <td className="h-10 overflow-hidden border-r border-b border-hairline px-3 whitespace-nowrap text-neutral-800">
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
