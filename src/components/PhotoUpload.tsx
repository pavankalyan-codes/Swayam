import { ImagePlus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

const maxPhotoBytes = 5 * 1024 * 1024
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

type PhotoUploadProps = {
  photo: string
  onPhotoChange: (photo: string) => void
}

export function PhotoUpload({ photo, onPhotoChange }: PhotoUploadProps) {
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File | undefined) {
    setError('')
    if (!file) return

    if (!acceptedTypes.includes(file.type)) {
      setError('Upload a JPG, PNG, or WEBP image.')
      return
    }

    if (file.size > maxPhotoBytes) {
      setError('Photo must be 5MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => onPhotoChange(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  return (
    <div className="rounded-lg border border-dashed border-rose-300 bg-rose-50/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-20 items-center justify-center overflow-hidden rounded-md border border-rose-200 bg-white">
          {photo ? (
            <img src={photo} alt="Uploaded profile" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-7 w-7 text-rose-600" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-900">Profile photo</p>
          <p className="mt-1 text-sm text-stone-600">JPG, PNG, or WEBP. Maximum 5MB.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              <ImagePlus className="h-4 w-4" />
              Upload
            </button>
            {photo ? (
              <button
                type="button"
                onClick={() => onPhotoChange('')}
                className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="sr-only"
          />
          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        </div>
      </div>
    </div>
  )
}
