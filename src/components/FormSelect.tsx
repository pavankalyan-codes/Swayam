import { cn } from '../lib/utils'

type FormSelectProps = {
  id: string
  label: string
  value: string
  options: ReadonlyArray<string>
  onChange: (value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export function FormSelect({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required,
  placeholder = 'Select',
}: FormSelectProps) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-stone-700">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'mt-2 w-full rounded-md border bg-white px-3 py-2.5 text-sm text-stone-950 outline-none transition',
          'focus:border-rose-500 focus:ring-4 focus:ring-rose-100',
          error ? 'border-red-400' : 'border-stone-200',
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
