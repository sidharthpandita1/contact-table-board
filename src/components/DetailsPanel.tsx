import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { m, useIsPresent, useReducedMotion } from 'motion/react'
import type { ButtonHTMLAttributes, KeyboardEvent, ReactNode } from 'react'
import { FIELDS, type FieldKey } from '../fields'
import { cn } from '../lib/cn'
import { KEEP_EDITING_ID, PANEL_ID, PANEL_TITLE_ID, fieldId, isEditable } from '../lib/dom'
import { EASE_DRAWER, EASE_OUT } from '../lib/motion'
import type { DetailsPanelController } from '../lib/useDetailsPanel'
import { ownerHue } from '../theme'
import type { Contact } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { CompanyMark } from './CompanyMark'
import { CopyButton } from './CopyButton'
import { EmptyValue } from './EmptyValue'
import { Kbd } from './Kbd'
import { LabelList } from './LabelList'
import { StageStepper } from './StageStepper'

export interface PanelPosition {
  index: number
  total: number
  prevId: string | null
  nextId: string | null
}

interface DetailsPanelProps {
  /** The live record from the store. */
  contact: Contact
  panel: DetailsPanelController
  /** Docked beside the view on wide screens, an overlay drawer on narrower ones. */
  mode: 'docked' | 'overlay'
  position: PanelPosition
}

const PANEL_WIDTH = 420
const GAP = 8

/**
 * Shows the live record. Only Stage and Notes are editable, and their edits stay in a
 * draft until Save. Read-only fields render as plain text, editable ones as controls.
 *
 * While animating out the panel is `inert` and drops its ids, so a quick reopen can never
 * produce duplicate ids or let a click land on the leaving copy.
 */
export function DetailsPanel({ contact, panel, mode, position }: DetailsPanelProps) {
  const present = useIsPresent()
  // Motion's reducedMotion setting covers transforms, not width; handle that one here.
  const reduce = useReducedMotion()
  const pid = (id: string) => (present ? id : undefined)

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      panel.save()
      return
    }
    // J/K page through records, Linear-style, unless the person is typing.
    if (e.metaKey || e.ctrlKey || e.altKey || isEditable(e.target)) return
    const target = e.key === 'j' ? position.nextId : e.key === 'k' ? position.prevId : null
    if (target) {
      e.preventDefault()
      panel.open(target)
    }
  }

  const body = <PanelBody contact={contact} panel={panel} position={position} pid={pid} />

  if (mode === 'docked') {
    // The wrapper grows from 0, so the view beside it narrows smoothly instead of jumping.
    return (
      <m.div
        initial={{ width: 0, opacity: 0 }}
        animate={{
          width: PANEL_WIDTH + GAP,
          opacity: 1,
          transition: {
            width: { duration: reduce ? 0 : 0.32, ease: EASE_DRAWER },
            opacity: { duration: 0.2 },
          },
        }}
        exit={{
          width: 0,
          opacity: 0,
          transition: {
            width: { duration: reduce ? 0 : 0.22, ease: EASE_OUT },
            opacity: { duration: 0.15 },
          },
        }}
        className="relative h-full shrink-0 overflow-hidden"
        inert={!present}
      >
        <div
          id={pid(PANEL_ID)}
          role="complementary"
          aria-labelledby={pid(PANEL_TITLE_ID)}
          onKeyDown={onKeyDown}
          className="absolute inset-y-0 right-0 flex flex-col overflow-hidden rounded-[14px] bg-white shadow-panel"
          style={{ width: PANEL_WIDTH }}
        >
          {body}
        </div>
      </m.div>
    )
  }

  return (
    <m.div
      id={pid(PANEL_ID)}
      role="dialog"
      aria-modal="true"
      aria-labelledby={pid(PANEL_TITLE_ID)}
      onKeyDown={onKeyDown}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1, transition: { duration: 0.34, ease: EASE_DRAWER } }}
      exit={{ x: 40, opacity: 0, transition: { duration: 0.2, ease: EASE_OUT } }}
      inert={!present}
      className="fixed inset-y-2 right-2 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-float"
      style={{ width: `min(${PANEL_WIDTH}px, calc(100vw - 16px))` }}
    >
      {body}
    </m.div>
  )
}

function PanelBody({
  contact,
  panel,
  position,
  pid,
}: {
  contact: Contact
  panel: DetailsPanelController
  position: PanelPosition
  pid: (id: string) => string | undefined
}) {
  const { draft, isDirty, pendingExit, pendingContact } = panel
  const stage = draft.stage ?? contact.stage
  const notes = draft.notes ?? contact.notes
  const meta = [contact.company, contact.role].filter(Boolean).join(' · ')

  return (
    <>
      {/* Top bar: where you are in the list, and the way out. */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-hairline px-2.5">
        <div className="flex items-center gap-0.5">
          <IconButton
            label="Previous contact (K)"
            disabled={!position.prevId}
            onClick={() => position.prevId && panel.open(position.prevId)}
          >
            <ChevronUp aria-hidden="true" className="size-4" />
          </IconButton>
          <IconButton
            label="Next contact (J)"
            disabled={!position.nextId}
            onClick={() => position.nextId && panel.open(position.nextId)}
          >
            <ChevronDown aria-hidden="true" className="size-4" />
          </IconButton>
          {position.index >= 0 && (
            <span className="ml-1.5 text-xs text-neutral-500 tabular-nums">
              {position.index + 1} of {position.total}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          aria-label="Close details"
          title="Close (Esc)"
          onClick={panel.requestClose}
          className="h-7 gap-1 px-1.5"
        >
          <Kbd>Esc</Kbd>
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <header className="flex items-start gap-3.5 px-5 pt-5">
          <Avatar name={contact.name} size="lg" />
          <div className="min-w-0 flex-1 pt-0.5">
            <h2
              id={pid(PANEL_TITLE_ID)}
              tabIndex={-1}
              className="text-[17px] leading-6 font-semibold tracking-[-0.015em] break-words text-neutral-900"
            >
              {contact.name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-neutral-500">
              {contact.company && <CompanyMark company={contact.company} />}
              {meta || <EmptyValue label="No company or role" display="No company or role" />}
            </p>
          </div>
        </header>

        <section className="px-5 pt-6">
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel field="stage" id={pid('stage-label')} />
            {stage !== contact.stage && <EditedTag />}
          </div>
          <StageStepper
            value={stage}
            onChange={(s) => panel.setField('stage', s)}
            id={pid(fieldId('stage'))}
            labelledBy="stage-label"
          />
        </section>

        <dl className="mt-5 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 px-5 text-[13px]">
          <Property field="email">
            {contact.email ? (
              <span className="flex min-w-0 items-center gap-1">
                <a
                  href={`mailto:${contact.email}`}
                  className="min-w-0 truncate underline decoration-neutral-300 underline-offset-2 hover:decoration-neutral-700"
                  title={contact.email}
                >
                  {contact.email}
                </a>
                <CopyButton text={contact.email} label="Copy email" />
              </span>
            ) : (
              <EmptyValue label="No email" display="Empty" />
            )}
          </Property>
          <Property field="company">
            {contact.company ? (
              <span className="flex items-center gap-2">
                <CompanyMark company={contact.company} />
                {contact.company}
              </span>
            ) : (
              <EmptyValue label="No company" display="Empty" />
            )}
          </Property>
          <Property field="role">
            {contact.role ?? <EmptyValue label="No role" display="Empty" />}
          </Property>
          <Property field="owner">
            {contact.owner ? (
              <span className="flex items-center gap-2">
                <Avatar name={contact.owner} size="xs" hue={ownerHue(contact.owner)} />
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

        <section className="px-5 pt-5 pb-6">
          <div className="mb-2 flex items-center justify-between">
            <FieldLabel field="notes" htmlFor={pid(fieldId('notes'))} />
            {notes !== contact.notes && <EditedTag />}
          </div>
          <textarea
            id={pid(fieldId('notes'))}
            value={notes}
            onChange={(e) => panel.setField('notes', e.target.value)}
            placeholder="Add notes…"
            rows={5}
            className="block max-h-80 min-h-32 w-full resize-none rounded-[10px] bg-neutral-900/[0.035] px-3 py-2.5 text-[13.5px] leading-[1.55] text-neutral-900 transition-[background-color,box-shadow] duration-150 [field-sizing:content] placeholder:text-neutral-500 hover:bg-neutral-900/[0.05] focus:bg-white focus:shadow-[inset_0_0_0_1px_var(--color-hairline-strong)] focus-visible:outline-offset-0"
          />
        </section>
      </div>

      <footer className="shrink-0 border-t border-hairline px-4 py-3">
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
              <Button id={pid(KEEP_EDITING_ID)} onClick={panel.keepEditing}>
                Keep editing
              </Button>
              <Button variant="danger" onClick={panel.discard}>
                Discard
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p aria-live="polite" className="flex items-center gap-2 text-xs text-neutral-500">
              {isDirty ? (
                <>
                  <span aria-hidden="true" className="relative flex size-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-amber-400 opacity-60 [animation-iteration-count:2]" />
                    <span className="relative size-2 rounded-full bg-amber-500" />
                  </span>
                  <span className="text-neutral-700">Unsaved changes</span>
                </>
              ) : (
                'No changes'
              )}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <Button variant="ghost" onClick={panel.cancel}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={panel.save}
                title="Save (⌘/Ctrl + Enter)"
                className="pr-2"
              >
                Save
                <Kbd dark>⌘↵</Kbd>
              </Button>
            </div>
          </div>
        )}
      </footer>
    </>
  )
}

function IconButton({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="inline-flex size-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-900/[0.05] hover:text-neutral-900 disabled:pointer-events-none disabled:opacity-35"
      {...props}
    >
      {children}
    </button>
  )
}

function FieldLabel({ field, htmlFor, id }: { field: FieldKey; htmlFor?: string; id?: string }) {
  const { label, icon: Icon } = FIELDS[field]
  const className = 'flex items-center gap-1.5 text-[13px] text-neutral-500'
  const content = (
    <>
      <Icon aria-hidden="true" className="size-3.5 text-neutral-400" />
      {label}
    </>
  )
  return htmlFor ? (
    <label htmlFor={htmlFor} id={id} className={className}>
      {content}
    </label>
  ) : (
    <span id={id} className={className}>
      {content}
    </span>
  )
}

function Property({ field, children }: { field: FieldKey; children: ReactNode }) {
  return (
    <>
      <dt className="flex min-h-9 items-center">
        <FieldLabel field={field} />
      </dt>
      <dd className="flex min-h-9 min-w-0 items-center py-1.5 break-words text-neutral-900">
        {children}
      </dd>
    </>
  )
}

function EditedTag() {
  return (
    <m.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.16, ease: EASE_OUT }}
      className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 shadow-[inset_0_0_0_1px_oklch(0.6_0.12_75/0.25)]"
    >
      Edited
    </m.span>
  )
}

export function Scrim({ onClick }: { onClick: () => void }) {
  return (
    <m.div
      aria-hidden="true"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      className={cn('fixed inset-0 z-40 bg-neutral-900/15 backdrop-blur-[2px]')}
    />
  )
}
