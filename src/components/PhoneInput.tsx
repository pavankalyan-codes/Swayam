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
}: PhoneInputProps) {
  return (
    <div>
      <span className="block text-sm font-medium text-stone-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="mt-2 grid grid-cols-[96px_1fr] gap-2">
        <select
          aria-label={`${label} country code`}
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="rounded-md border border-stone-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
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
            'rounded-md border bg-white px-3 py-2.5 text-sm text-stone-950 outline-none transition',
            'placeholder:text-stone-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100',
            error ? 'border-red-400' : 'border-stone-200',
          )}
        />
      </div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </div>
  )
}
