import { companyAndRole } from '../lib/format'
import { PANEL_ID, openButtonId } from '../lib/dom'
import { ownerTint } from '../theme'
import type { Contact } from '../types'
import { Avatar } from './Avatar'
import { LabelList } from './LabelList'

interface ContactCardProps {
  contact: Contact
  selected: boolean
  onOpen: (id: string) => void
}

/**
 * Cards carry only what helps triage a stage: who, where, tags, and who owns it.
 * Missing values drop their line instead of showing placeholders. Email and notes live in the panel.
 */
export function ContactCard({ contact, selected, onOpen }: ContactCardProps) {
  const { id, name, company, role, owner, labels } = contact
  const meta = companyAndRole(company, role)
  const hasFooter = labels.length > 0 || owner

  return (
    <article
      data-record-id={id}
      data-selected={selected}
      className="relative rounded-md border border-neutral-200 bg-white p-3 shadow-xs transition-[border-color,box-shadow] hover:border-neutral-300 hover:shadow-sm has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-blue-600 data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-50/40 data-[selected=true]:ring-1 data-[selected=true]:ring-blue-500"
    >
      <h3 className="text-[13px] leading-5 font-medium text-neutral-900">
        {/* The ::after overlay stretches the button over the whole card. */}
        <button
          type="button"
          id={openButtonId(id)}
          aria-expanded={selected}
          aria-controls={selected ? PANEL_ID : undefined}
          onClick={() => onOpen(id)}
          title={name}
          className="block w-full truncate text-left after:absolute after:inset-0 after:rounded-md focus-visible:outline-hidden"
        >
          {name}
        </button>
      </h3>
      {meta && (
        <p className="mt-0.5 truncate text-xs leading-4 text-neutral-500" title={meta}>
          {meta}
        </p>
      )}
      {hasFooter && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <LabelList labels={labels} max={2} showEmpty={false} />
          {owner && (
            <span className="ml-auto shrink-0" title={`Owner: ${owner}`}>
              <Avatar name={owner} tint={ownerTint(owner)} />
              <span className="sr-only">Owner: {owner}</span>
            </span>
          )}
        </div>
      )}
    </article>
  )
}
