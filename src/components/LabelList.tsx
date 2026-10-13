import { labelHue } from '../theme'
import { EmptyValue } from './EmptyValue'

interface LabelListProps {
  labels: string[]
  /** Show this many chips, then a "+N" chip. Omit to show every label and wrap. */
  max?: number
  /** Render the empty state. Cards skip it to save a line. */
  showEmpty?: boolean
}

const chip =
  'inline-flex h-5 min-w-0 items-center gap-1.5 rounded-md bg-white px-1.5 text-xs whitespace-nowrap text-neutral-700 shadow-[inset_0_0_0_1px_var(--color-hairline-strong)]'

export function LabelList({ labels, max, showEmpty = true }: LabelListProps) {
  if (labels.length === 0) return showEmpty ? <EmptyValue label="No labels" /> : null

  const visible = max === undefined ? labels : labels.slice(0, max)
  const hidden = labels.slice(visible.length)

  return (
    <ul
      aria-label="Labels"
      className={max === undefined ? 'flex flex-wrap gap-1' : 'flex min-w-0 gap-1 overflow-hidden'}
    >
      {/* Labels may truncate in tight spaces; the "+N" chip never does. */}
      {visible.map((label) => (
        <li key={label} className={`${chip} ${max === undefined ? '' : 'shrink'}`} title={label}>
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: `oklch(0.68 0.13 ${labelHue(label)})` }}
          />
          {/* Padding gives descenders room inside the clipped, cap-trimmed box. */}
          <span className="text-trim -my-1 truncate py-1">{label}</span>
        </li>
      ))}
      {hidden.length > 0 && (
        <li className={`${chip} shrink-0 text-neutral-500 tabular-nums`} title={hidden.join(', ')}>
          <span aria-hidden="true" className="text-trim">
            +{hidden.length}
          </span>
          <span className="sr-only">and {hidden.join(', ')}</span>
        </li>
      )}
    </ul>
  )
}
