import { cn } from '../lib/utils'

type PreviewRowProps = {
  label: string
  value?: string
  fullWidth?: boolean
}

export function PreviewRow({ label, value, fullWidth }: PreviewRowProps) {
  if (!value?.trim()) return null

  return (
    <div className={cn(
      "preview-row min-w-0 break-inside-avoid border-b border-rose-100 py-1.5 text-[13px] leading-5",
      fullWidth && "sm:col-span-2"
    )}>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9F1239]">
        {label}
      </dt>
      <dd className="mt-0.5 min-w-0 break-words text-stone-950">{value}</dd>
    </div>
  )
}
