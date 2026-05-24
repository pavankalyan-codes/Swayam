import { cn } from '../lib/utils'

type FormInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  type?: string
  placeholder?: string
  multiline?: boolean
}

export function FormInput({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = 'text',
  placeholder,
  multiline,
}: FormInputProps) {
  const inputClass = cn(
    'mt-2 w-full rounded-md border bg-white px-3 py-2.5 text-sm text-stone-950 outline-none transition',
    'placeholder:text-stone-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100',
    error ? 'border-red-400' : 'border-stone-200',
  )

  return (
    <label htmlFor={id} className="block text-sm font-medium text-stone-700">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className={cn(inputClass, 'resize-y')}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
