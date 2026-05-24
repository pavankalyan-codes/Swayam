type PreviewRowProps = {
  label: string
  value?: string
}

export function PreviewRow({ label, value }: PreviewRowProps) {
  if (!value?.trim()) return null

  return (
    <div className="preview-row break-inside-avoid border-b border-rose-100 py-1.5 text-[13px] leading-5">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9F1239]">
        {label}
      </dt>
      <dd className="mt-0.5 text-stone-950">{value}</dd>
    </div>
  )
}
