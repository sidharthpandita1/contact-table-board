/** Stable DOM ids shared by the views and the details panel. */
export const PANEL_ID = 'details-panel'
export const PANEL_TITLE_ID = 'details-panel-title'
export const KEEP_EDITING_ID = 'details-keep-editing'
export const VIEW_PANEL_ID = 'view-panel'
export const SEARCH_ID = 'contact-search'
export const TABLE_REGION_ID = 'contacts-table'

/** Only one view is mounted at a time, so the table row and the board card share an id. */
export const openButtonId = (contactId: string) => `open-${contactId}`
export const fieldId = (field: string) => `field-${field}`
export const tabId = (view: string) => `view-tab-${view}`

/** Returns false when the element is not in the DOM, so callers can fall back. */
export function focusById(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false
  el.focus({ preventScroll: true })
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  return true
}

/** True when a keypress should go to a text field rather than a shortcut. */
export function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLInputElement && !['checkbox', 'radio', 'button'].includes(target.type))
  )
}

/**
 * Brief highlight on a row or card after it changes (37signals' "yellow fade"), tinted with
 * the record's stage so the colour says where it went. Colour only, so it also runs with
 * reduced motion. Web Animations API, so repeated saves restart it cleanly.
 */
export function flashRecord(contactId: string) {
  const selector = `[data-record-id="${typeof CSS !== 'undefined' ? CSS.escape(contactId) : contactId}"]`
  const el = document.querySelector<HTMLElement>(selector)
  if (!el || typeof el.animate !== 'function') return
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  // Fade back to the element's own background (rows must stay opaque under the sticky column).
  const resting = getComputedStyle(el).backgroundColor
  el.animate([{ backgroundColor: 'var(--tone-flash)' }, { backgroundColor: resting }], {
    duration: 900,
    delay: 120,
    fill: 'backwards',
    easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  })
}
