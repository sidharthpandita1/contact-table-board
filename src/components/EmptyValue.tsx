interface EmptyValueProps {
  /** What screen readers hear, e.g. "No email". */
  label: string
  /** What sighted users see. A dash in dense views, a word in the panel. */
  display?: string
}

export function EmptyValue({ label, display = '—' }: EmptyValueProps) {
  return (
    <span className="text-neutral-500">
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
