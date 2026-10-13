import { hueFor } from '../theme'

/** A 16px letter-mark standing in for a company logo. Decorative; the name sits beside it. */
export function CompanyMark({ company }: { company: string }) {
  const hue = hueFor(company)
  return (
    <span
      aria-hidden="true"
      style={{
        backgroundImage: `linear-gradient(150deg, oklch(0.62 0.13 ${hue}), oklch(0.5 0.14 ${hue + 20}))`,
      }}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-semibold text-white shadow-[inset_0_0_0_1px_oklch(0_0_0/0.1)]"
    >
      {company.trim()[0]?.toUpperCase()}
    </span>
  )
}
