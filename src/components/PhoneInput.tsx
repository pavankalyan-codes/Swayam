import { countryCodeOptions } from '../data/options'
import { cn } from '../lib/utils'

type PhoneInputProps = {
  id: string
  label: string
  countryCode: string
  phone: string
  onCountryCodeChange: (value: string) => void
  onPhoneChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
}

export function PhoneInput({
  id,
  label,
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  error,
  required,
  className,
}: PhoneInputProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <span className="block text-sm font-medium text-stone-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="mt-2 grid min-w-0 grid-cols-[92px_minmax(0,1fr)] gap-3 sm:grid-cols-[104px_minmax(0,1fr)]">
        <select
          aria-label={`${label} country code`}
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="min-w-0 rounded-md border border-stone-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
        >
          {countryCodeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <input
          id={id}
          inputMode="numeric"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value.replace(/\D/g, ''))}
          placeholder="Digits only"
          className={cn(
            'min-w-0 rounded-md border bg-white px-3 py-3 text-sm text-stone-950 outline-none transition',
            'placeholder:text-stone-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-100',
            error ? 'border-red-400' : 'border-stone-200',
          )}
        />
      </div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </div>
  )
}
