import { useDraggable } from '@dnd-kit/react'
import type { KeyboardEvent } from 'react'
import { PANEL_ID, openButtonId } from '../lib/dom'
import { ownerHue } from '../theme'
import type { Contact } from '../types'
import { Avatar } from './Avatar'
import { CompanyMark } from './CompanyMark'
import { LabelList } from './LabelList'

interface ContactCardProps {
  contact: Contact
  selected: boolean
  /** The open record with an unsaved stage draft can't be dragged; Save would overwrite the drop. */
  dragDisabled: boolean
  onOpen: (id: string) => void
  onKeyDown: (e: KeyboardEvent, contact: Contact) => void
}

/**
 * Cards carry only what helps triage a stage: who, where, tags, and who owns it.
 * Missing values drop their line instead of showing placeholders. Email and notes live in the panel.
 */
export function ContactCard({
  contact,
  selected,
  dragDisabled,
  onOpen,
  onKeyDown,
}: ContactCardProps) {
  const { id, name, company, role, owner, labels, stage } = contact
  const { ref, isDragging } = useDraggable({ id, type: 'card', disabled: dragDisabled })
  const meta = [company, role].filter(Boolean).join(' · ')
  const hasFooter = labels.length > 0 || owner

  return (
    <article
      ref={ref}
      data-record-id={id}
      data-tone={stage}
      data-selected={selected}
      data-dragging={isDragging}
      className="group relative cursor-grab touch-manipulation rounded-[10px] bg-white p-3 shadow-card transition-[box-shadow,scale,opacity] duration-200 ease-out select-none hover:shadow-card-hover has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-2 has-[button:focus-visible]:outline-blue-600 data-[dragging=true]:scale-[1.025] data-[dragging=true]:cursor-grabbing data-[dragging=true]:shadow-lift data-[selected=true]:shadow-[0_0_0_1.5px_var(--color-blue-600),0_4px_12px_-4px_oklch(0.55_0.2_255/0.3)]"
    >
      <div className="flex items-center gap-2">
        <Avatar name={name} />
        <h3 className="min-w-0 flex-1 text-[13.5px] leading-5 font-medium text-neutral-900">
          {/* The ::after overlay stretches the button over the whole card. */}
          <button
            type="button"
            id={openButtonId(id)}
            aria-expanded={selected}
            aria-controls={selected ? PANEL_ID : undefined}
            onClick={() => onOpen(id)}
            onKeyDown={(e) => onKeyDown(e, contact)}
            title={name}
            className="block w-full cursor-grab truncate text-left after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-hidden group-data-[dragging=true]:cursor-grabbing"
          >
            {name}
          </button>
        </h3>
      </div>
      {meta && (
        <p
          className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[12.5px] text-neutral-500"
          title={meta}
        >
          {company && <CompanyMark company={company} />}
          <span className="truncate">{meta}</span>
        </p>
      )}
      {hasFooter && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <LabelList labels={labels} max={2} showEmpty={false} />
          {owner && (
            <span className="ml-auto shrink-0" title={`Owner: ${owner}`}>
              <Avatar name={owner} size="xs" hue={ownerHue(owner)} />
              <span className="sr-only">Owner: {owner}</span>
            </span>
          )}
        </div>
      )}
    </article>
  )
}
