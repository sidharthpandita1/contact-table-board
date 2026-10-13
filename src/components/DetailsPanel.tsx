import { ChevronDown, X } from 'lucide-react'
import type { KeyboardEvent, ReactNode } from 'react'
import { FIELDS, type FieldKey } from '../fields'
import { cn } from '../lib/cn'
import { KEEP_EDITING_ID, PANEL_ID, PANEL_TITLE_ID, fieldId } from '../lib/dom'
import { companyAndRole } from '../lib/format'
import type { DetailsPanelController } from '../lib/useDetailsPanel'
import { ownerTint } from '../theme'
import { STAGES, isStage, type Contact } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { EmptyValue } from './EmptyValue'
import { LabelList } from './LabelList'
import { StageDot } from './StageBadge'

interface DetailsPanelProps {
  /** The live record from the store. */
  contact: Contact
  panel: DetailsPanelController
  /** Docked beside the view on wide screens, an overlay drawer on narrower ones. */
  mode: 'docked' | 'overlay'
}

/**
 * Shows the live record. Only Stage and Notes are editable, and their edits stay in a
 * draft until Save. Read-only fields render as plain text, editable ones as controls.
 */
export function DetailsPanel({ contact, panel, mode }: DetailsPanelProps) {
  const { draft, isDirty, pendingExit, pendingContact } = panel
  const stage = draft.stage ?? contact.stage
  const notes = draft.notes ?? contact.notes
  const meta = companyAndRole(contact.company, contact.role)

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      panel.save()
    }
  }

  return (
    <div
      id={PANEL_ID}
      role={mode === 'overlay' ? 'dialog' : 'complementary'}
      aria-modal={mode === 'overlay' ? true : undefined}
      aria-labelledby={PANEL_TITLE_ID}
      onKeyDown={onKeyDown}
      className={cn(
        'flex h-full w-[420px] max-w-full flex-col bg-white transition-[opacity,translate] duration-200 starting:opacity-0',
        mode === 'docked'
          ? 'shrink-0 border-l border-neutral-200'
          : 'fixed inset-y-0 right-0 z-50 shadow-2xl starting:translate-x-6',
      )}
    >
      <header className="flex items-start gap-3 border-b border-neutral-200 px-5 pt-5 pb-4">
        <Avatar name={contact.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h2
            id={PANEL_TITLE_ID}
            tabIndex={-1}
            className="text-lg leading-6 font-semibold break-words text-neutral-900"
          >
            {contact.name}
          </h2>
          <p className="mt-0.5 text-[13px] text-neutral-500">
            {meta || <EmptyValue label="No company or role" display="No company or role" />}
          </p>
        </div>
        <Button
          variant="ghost"
          aria-label="Close details"
          title="Close (Esc)"
          onClick={panel.requestClose}
          className="-mt-1 -mr-2 size-8 px-0 text-neutral-500"
        >
          <X aria-hidden="true" className="size-[18px]" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-3 text-[13px]">
          <Property field="stage" htmlFor={fieldId('stage')}>
            <div className="flex items-center gap-2">
              <div className="relative w-44">
                <StageDot
                  stage={stage}
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                />
                <select
                  id={fieldId('stage')}
                  value={stage}
                  onChange={(e) => {
                    if (isStage(e.target.value)) panel.setField('stage', e.target.value)
                  }}
                  className="h-8 w-full appearance-none rounded-md border border-neutral-300 bg-white pr-8 pl-7 text-[13px] text-neutral-900 hover:border-neutral-400"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-neutral-400"
                />
              </div>
              {stage !== contact.stage && <EditedTag />}
            </div>
          </Property>
          <Property field="email">
            {contact.email ? (
              <a
                href={`mailto:${contact.email}`}
                className="break-all underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-700"
              >
                {contact.email}
              </a>
            ) : (
              <EmptyValue label="No email" display="Empty" />
            )}
          </Property>
          <Property field="company">
            {contact.company ?? <EmptyValue label="No company" display="Empty" />}
          </Property>
          <Property field="role">
            {contact.role ?? <EmptyValue label="No role" display="Empty" />}
          </Property>
          <Property field="owner">
            {contact.owner ? (
              <span className="flex items-center gap-1.5">
                <Avatar name={contact.owner} tint={ownerTint(contact.owner)} />
                {contact.owner}
              </span>
            ) : (
              <EmptyValue label="No owner" display="Empty" />
            )}
          </Property>
          <Property field="labels">
            {contact.labels.length > 0 ? (
              <LabelList labels={contact.labels} />
            ) : (
              <EmptyValue label="No labels" display="Empty" />
            )}
          </Property>
        </dl>

        <div className="mt-5 border-t border-neutral-100 pt-4">
          <div className="mb-2 flex items-center gap-1.5">
            <FieldLabel field="notes" htmlFor={fieldId('notes')} />
            {notes !== contact.notes && <EditedTag />}
          </div>
          <textarea
            id={fieldId('notes')}
            value={notes}
            onChange={(e) => panel.setField('notes', e.target.value)}
            placeholder="Add notes…"
            rows={8}
            className="block min-h-40 w-full resize-y rounded-md border border-neutral-300 bg-white px-3 py-2 text-[13px] leading-5 text-neutral-900 placeholder:text-neutral-500 hover:border-neutral-400"
          />
        </div>
      </div>

      <footer className="border-t border-neutral-200 px-5 py-3">
        {pendingExit ? (
          <div
            role="group"
            aria-labelledby="discard-prompt"
            className="flex items-center justify-between gap-3"
          >
            <p id="discard-prompt" className="min-w-0 text-[13px] text-neutral-900">
              <span className="font-medium">Discard unsaved changes?</span>
              {pendingContact && (
                <span className="block truncate text-xs text-neutral-500">
                  to open {pendingContact.name}
                </span>
              )}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button id={KEEP_EDITING_ID} onClick={panel.keepEditing}>
                Keep editing
              </Button>
              <Button variant="danger" onClick={panel.discard}>
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="flex items-center gap-1.5 text-xs text-neutral-500">
              {isDirty ? (
                <>
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
                  <span className="text-neutral-700">Unsaved changes</span>
                </>
              ) : (
                'No changes'
              )}
            </p>
            <div className="flex shrink-0 gap-2">
              <Button onClick={panel.cancel}>Cancel</Button>
              <Button variant="primary" onClick={panel.save} title="Save (⌘/Ctrl + Enter)">
                Save
              </Button>
            </div>
          </div>
        )}
      </footer>
    </div>
  )
}

function FieldLabel({ field, htmlFor }: { field: FieldKey; htmlFor?: string }) {
  const { label, icon: Icon } = FIELDS[field]
  const Tag = htmlFor ? 'label' : 'span'
  return (
    <Tag htmlFor={htmlFor} className="flex items-center gap-1.5 text-[13px] text-neutral-500">
      <Icon aria-hidden="true" className="size-3.5 text-neutral-400" />
      {label}
    </Tag>
  )
}

function Property({
  field,
  htmlFor,
  children,
}: {
  field: FieldKey
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <>
      <dt className="flex min-h-9 items-center">
        <FieldLabel field={field} htmlFor={htmlFor} />
      </dt>
      <dd className="flex min-h-9 min-w-0 items-center py-1.5 break-words text-neutral-900">
        {children}
      </dd>
    </>
  )
}

function EditedTag() {
  return (
    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
      Edited
    </span>
  )
}
