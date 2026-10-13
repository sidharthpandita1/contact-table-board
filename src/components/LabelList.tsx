import { EmptyValue } from './EmptyValue'

interface LabelListProps {
  labels: string[]
  /** Show this many chips, then a "+N" chip. Omit to show every label and wrap. */
  max?: number
  /** Render the empty state. Cards skip it to save a line. */
  showEmpty?: boolean
}

const chip = 'inline-flex h-5 items-center rounded bg-neutral-100 px-1.5 text-xs text-neutral-700'

export function LabelList({ labels, max, showEmpty = true }: LabelListProps) {
  if (labels.length === 0) return showEmpty ? <EmptyValue label="No labels" /> : null

  const visible = max === undefined ? labels : labels.slice(0, max)
  const hidden = labels.slice(visible.length)

  return (
    <ul
      aria-label="Labels"
      className={max === undefined ? 'flex flex-wrap gap-1' : 'flex min-w-0 gap-1 overflow-hidden'}
    >
      {visible.map((label) => (
        <li key={label} className={`${chip} shrink-0 whitespace-nowrap`}>
          {label}
        </li>
      ))}
      {hidden.length > 0 && (
        <li className={`${chip} shrink-0 text-neutral-500`} title={hidden.join(', ')}>
          <span aria-hidden="true">+{hidden.length}</span>
          <span className="sr-only">and {hidden.join(', ')}</span>
        </li>
      )}
    </ul>
  )
}
