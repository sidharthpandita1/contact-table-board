import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  hint?: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon: Icon, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
      <span className="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-white text-neutral-400 shadow-card">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <p className="text-sm font-medium text-neutral-900">{title}</p>
      {hint && <p className="max-w-72 text-[13px] text-neutral-500">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
