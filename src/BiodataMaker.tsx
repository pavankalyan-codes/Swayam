import * as Accordion from '@radix-ui/react-accordion'
import { useForm } from '@tanstack/react-form'
import { FileImage, FileText, Sparkles, RotateCcw } from 'lucide-react'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AccordionSection } from './components/AccordionSection'
import { BiodataPreview } from './components/BiodataPreview'
import { FormInput } from './components/FormInput'
import { FormSelect } from './components/FormSelect'
import { PhoneInput } from './components/PhoneInput'
import { PhotoUpload } from './components/PhotoUpload'
import { backgroundOptions, getDefaultBackground } from './data/backgrounds'
import {
  dietOptions,
  genderOptions,
  hourOptions,
  maritalStatusOptions,
  meridiemOptions,
  minuteOptions,
  workSectorOptions,
} from './data/options'
import { emptyBiodataForm, sampleBiodataForm } from './data/initialForm'
import type { BiodataForm, FieldErrors } from './types/biodata'

const draftKey = 'marriage-biodata-draft-v1'

const requiredFields: Array<[string, string]> = [
  ['personal.firstName', 'First name is required.'],
  ['personal.lastName', 'Last name is required.'],
  ['personal.gender', 'Gender is required.'],
  ['personal.dob', 'Date of birth is required.'],
  ['personal.height', 'Height is required.'],
  ['personal.maritalStatus', 'Marital status is required.'],
  ['personal.religion', 'Religion is required.'],
  ['personal.community', 'Community is required.'],
  ['personal.diet', 'Diet is required.'],
  ['personal.livingIn', 'Living country is required.'],
  ['personal.state', 'State / Province is required.'],
  ['personal.city', 'City is required.'],
  ['career.highestQualification', 'Highest qualification is required.'],
  ['career.collegeName', 'College name is required.'],
  ['career.workSector', 'Work sector is required.'],
  ['career.occupation', 'Job / occupation is required.'],
  ['career.companyName', 'Company name is required.'],
  ['career.annualIncome', 'Annual income is required.'],
  ['contact.phone', 'Contact number is required.'],
  ['contact.email', 'Email is required.'],
]

export function BiodataMaker() {
  const [formData, setFormData] = useState<BiodataForm>(emptyBiodataForm)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [draftReady, setDraftReady] = useState(false)
  const [exporting, setExporting] = useState<'jpeg' | 'pdf' | null>(null)

  const tanstackForm = useForm({
    defaultValues: formData,
    onSubmit: () => {
      exportPdf()
    },
  })

  useEffect(() => {
    setFormData(loadDraft())
    setDraftReady(true)
  }, [])

  useEffect(() => {
    if (draftReady && typeof window !== 'undefined') {
      window.localStorage.setItem(draftKey, JSON.stringify(formData))
    }
  }, [draftReady, formData])

  const filledRequiredCount = useMemo(
    () =>
      requiredFields.filter(([path]) => String(getValue(formData, path) ?? '').trim())
        .length,
    [formData],
  )

  const requiredTotal = requiredFields.length

  function updateField(path: string, value: string) {
    setFormData((current) => setValue(current, path, value))
    setErrors((current) => {
      if (!current[path]) return current
      const next = { ...current }
      delete next[path]
      return next
    })
  }

  function updatePhone(path: string, value: string) {
    updateField(path, value.replace(/\D/g, ''))
  }

  function resetForm() {
    setFormData(emptyBiodataForm)
    setErrors({})
    window.localStorage.removeItem(draftKey)
    tanstackForm.reset()
  }

  function useSampleData() {
    setFormData(sampleBiodataForm)
    setErrors({})
    tanstackForm.reset()
  }

  async function prepareExport() {
    const trimmed = trimForm(formData)
    const nextErrors = validateForm(trimmed)
    setFormData(trimmed)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      document.querySelector('[data-first-error="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return null
    }

    await waitForPreviewAssets()
    return trimmed
  }

  function fileBaseName(data: BiodataForm) {
    const filenameName = [data.personal.firstName, data.personal.lastName]
      .filter(Boolean)
      .join('-')
      .toLowerCase()

    return `marriage-biodata-${filenameName || 'profile'}`
  }

  async function capturePreview() {
    const preview = document.getElementById('biodata-preview')
    if (!preview) throw new Error('Biodata preview was not found.')

    preview.classList.add('export-canvas')
    const restoreImages = await inlinePreviewImages(preview)

    try {
      await waitForPreviewAssets()
      await applyExportFit(preview)

      return await toJpeg(preview, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#fffaf0',
        height: 1123,
        width: 794,
      })
    } finally {
      restoreImages()
      preview.classList.remove('export-canvas', 'export-compact', 'export-ultra-compact')
    }
  }

  async function exportJpeg() {
    setExporting('jpeg')
    try {
      const data = await prepareExport()
      if (!data) return

      const jpeg = await capturePreview()
      const link = document.createElement('a')
      link.href = jpeg
      link.download = `${fileBaseName(data)}.jpg`
      link.click()
    } finally {
      setExporting(null)
    }
  }

  async function exportPdf() {
    setExporting('pdf')
    try {
      const data = await prepareExport()
      if (!data) return

      const jpeg = await capturePreview()
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })
      pdf.addImage(jpeg, 'JPEG', 0, 0, 210, 297, undefined, 'FAST')
      pdf.save(`${fileBaseName(data)}.pdf`)
    } finally {
      setExporting(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-stone-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="no-print mb-6 flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[0.02em] text-stone-950 sm:text-5xl brand-heading">
              Swayam
            </h1>
            <p className="mt-3 max-w-2xl brand-tagline">
              Where families begin.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Form
            </button>
            <button
              type="button"
              onClick={useSampleData}
              className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              <Sparkles className="h-4 w-4" />
              Try Sample
            </button>
            <button
              type="button"
              onClick={() => tanstackForm.handleSubmit()}
              disabled={Boolean(exporting)}
              className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {exporting === 'pdf' ? 'Saving PDF...' : 'Save as PDF'}
            </button>
            <button
              type="button"
              onClick={exportJpeg}
              disabled={Boolean(exporting)}
              className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileImage className="h-4 w-4" />
              {exporting === 'jpeg' ? 'Saving JPEG...' : 'Download JPEG'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,650px)_minmax(620px,1fr)]">
          <section className="no-print">
            <div className="mb-4 rounded-lg border border-amber-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-stone-800">
                  Required fields completed
                </p>
                <p className="text-sm font-bold text-amber-700">
                  {filledRequiredCount}/{requiredTotal}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-amber-600 transition-all"
                  style={{ width: `${(filledRequiredCount / requiredTotal) * 100}%` }}
                />
              </div>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                tanstackForm.handleSubmit()
              }}
            >
              {Object.keys(errors).length > 0 ? (
                <span data-first-error="true" className="sr-only" />
              ) : null}
              <Accordion.Root
                type="multiple"
                defaultValue={[
                  'personal',
                  'career',
                  'family',
                  'contact',
                  'background',
                  'photo',
                ]}
                className="space-y-4"
              >
                <AccordionSection
                  value="personal"
                  title="Personal Details"
                  description="Core identity, birth, lifestyle, and location details."
                >
                  <FieldGrid>
                    <FormInput
                      id="firstName"
                      label="First Name"
                      required
                      value={formData.personal.firstName}
                      error={errors['personal.firstName']}
                      onChange={(value) => updateField('personal.firstName', value)}
                    />
                    <FormInput
                      id="lastName"
                      label="Last Name"
                      required
                      value={formData.personal.lastName}
                      error={errors['personal.lastName']}
                      onChange={(value) => updateField('personal.lastName', value)}
                    />
                    <FormSelect
                      id="gender"
                      label="Gender"
                      required
                      options={genderOptions}
                      value={formData.personal.gender}
                      error={errors['personal.gender']}
                      onChange={(value) => updateField('personal.gender', value)}
                    />
                    <FormInput
                      id="dob"
                      type="date"
                      label="Date of Birth"
                      required
                      value={formData.personal.dob}
                      error={errors['personal.dob']}
                      onChange={(value) => updateField('personal.dob', value)}
                    />
                    <FormInput
                      id="placeOfBirth"
                      label="Place of Birth"
                      value={formData.personal.placeOfBirth}
                      onChange={(value) => updateField('personal.placeOfBirth', value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormSelect
                        id="birthHour"
                        label="Hour"
                        options={hourOptions}
                        value={formData.personal.timeOfBirth.hour}
                        onChange={(value) => updateField('personal.timeOfBirth.hour', value)}
                      />
                      <FormSelect
                        id="birthMinute"
                        label="Minute"
                        options={minuteOptions}
                        value={formData.personal.timeOfBirth.minute}
                        onChange={(value) => updateField('personal.timeOfBirth.minute', value)}
                      />
                      <FormSelect
                        id="birthMeridiem"
                        label="AM/PM"
                        options={meridiemOptions}
                        value={formData.personal.timeOfBirth.meridiem}
                        onChange={(value) => updateField('personal.timeOfBirth.meridiem', value)}
                      />
                    </div>
                    <FormInput
                      id="height"
                      label="Height"
                      required
                      placeholder="5 ft 8 in"
                      value={formData.personal.height}
                      error={errors['personal.height']}
                      onChange={(value) => updateField('personal.height', value)}
                    />
                    <FormSelect
                      id="maritalStatus"
                      label="Marital Status"
                      required
                      options={maritalStatusOptions}
                      value={formData.personal.maritalStatus}
                      error={errors['personal.maritalStatus']}
                      onChange={(value) => updateField('personal.maritalStatus', value)}
                    />
                    <FormInput
                      id="religion"
                      label="Religion"
                      required
                      value={formData.personal.religion}
                      error={errors['personal.religion']}
                      onChange={(value) => updateField('personal.religion', value)}
                    />
                    <FormInput
                      id="motherTongue"
                      label="Mother Tongue"
                      value={formData.personal.motherTongue}
                      onChange={(value) => updateField('personal.motherTongue', value)}
                    />
                    <FormInput
                      id="community"
                      label="Community"
                      required
                      value={formData.personal.community}
                      error={errors['personal.community']}
                      onChange={(value) => updateField('personal.community', value)}
                    />
                    <FormSelect
                      id="diet"
                      label="Diet"
                      required
                      options={dietOptions}
                      value={formData.personal.diet}
                      error={errors['personal.diet']}
                      onChange={(value) => updateField('personal.diet', value)}
                    />
                    <FormInput
                      id="complexion"
                      label="Complexion"
                      value={formData.personal.complexion}
                      onChange={(value) => updateField('personal.complexion', value)}
                    />
                    <FormInput
                      id="livingIn"
                      label="Living In"
                      required
                      value={formData.personal.livingIn}
                      error={errors['personal.livingIn']}
                      onChange={(value) => updateField('personal.livingIn', value)}
                    />
                    <FormInput
                      id="state"
                      label="State / Province"
                      required
                      value={formData.personal.state}
                      error={errors['personal.state']}
                      onChange={(value) => updateField('personal.state', value)}
                    />
                    <FormInput
                      id="city"
                      label="City"
                      required
                      value={formData.personal.city}
                      error={errors['personal.city']}
                      onChange={(value) => updateField('personal.city', value)}
                    />
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="career"
                  title="Education & Career"
                  description="Education, occupation, company, and income."
                >
                  <FieldGrid>
                    <FormInput
                      id="highestQualification"
                      label="Highest Qualification"
                      required
                      value={formData.career.highestQualification}
                      error={errors['career.highestQualification']}
                      onChange={(value) => updateField('career.highestQualification', value)}
                    />
                    <FormInput
                      id="collegeName"
                      label="College Name"
                      required
                      value={formData.career.collegeName}
                      error={errors['career.collegeName']}
                      onChange={(value) => updateField('career.collegeName', value)}
                    />
                    <FormSelect
                      id="workSector"
                      label="Work Sector"
                      required
                      options={workSectorOptions}
                      value={formData.career.workSector}
                      error={errors['career.workSector']}
                      onChange={(value) => updateField('career.workSector', value)}
                    />
                    <FormInput
                      id="occupation"
                      label="Job / Occupation"
                      required
                      value={formData.career.occupation}
                      error={errors['career.occupation']}
                      onChange={(value) => updateField('career.occupation', value)}
                    />
                    <FormInput
                      id="companyName"
                      label="Company Name"
                      required
                      value={formData.career.companyName}
                      error={errors['career.companyName']}
                      onChange={(value) => updateField('career.companyName', value)}
                    />
                    <FormInput
                      id="annualIncome"
                      label="Annual Income"
                      required
                      value={formData.career.annualIncome}
                      error={errors['career.annualIncome']}
                      onChange={(value) => updateField('career.annualIncome', value)}
                    />
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="family"
                  title="Family Details"
                  description="Parents and sibling information for the biodata."
                >
                  <FieldGrid>
                    <FormInput
                      id="fatherName"
                      label="Father's Name"
                      value={formData.family.fatherName}
                      onChange={(value) => updateField('family.fatherName', value)}
                    />
                    <FormInput
                      id="fatherOccupation"
                      label="Father's Occupation"
                      value={formData.family.fatherOccupation}
                      onChange={(value) => updateField('family.fatherOccupation', value)}
                    />
                    <FormInput
                      id="motherName"
                      label="Mother's Name"
                      value={formData.family.motherName}
                      onChange={(value) => updateField('family.motherName', value)}
                    />
                    <FormInput
                      id="motherOccupation"
                      label="Mother's Occupation"
                      value={formData.family.motherOccupation}
                      onChange={(value) => updateField('family.motherOccupation', value)}
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        id="siblings"
                        label="Siblings"
                        placeholder="Example: One elder sister, married"
                        value={formData.family.siblings}
                        onChange={(value) => updateField('family.siblings', value)}
                      />
                    </div>
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="contact"
                  title="Contact Information"
                  description="Phone, email, and address details for sharing."
                >
                  <FieldGrid>
                    <PhoneInput
                      id="phone"
                      label="Contact Number"
                      required
                      countryCode={formData.contact.countryCode}
                      phone={formData.contact.phone}
                      error={errors['contact.phone']}
                      onCountryCodeChange={(value) => updateField('contact.countryCode', value)}
                      onPhoneChange={(value) => updatePhone('contact.phone', value)}
                    />
                    <FormInput
                      id="email"
                      type="email"
                      label="Email ID"
                      required
                      value={formData.contact.email}
                      error={errors['contact.email']}
                      onChange={(value) => updateField('contact.email', value)}
                    />
                    <PhoneInput
                      id="fatherPhone"
                      label="Father's Contact Number"
                      countryCode={formData.contact.fatherCountryCode}
                      phone={formData.contact.fatherPhone}
                      error={errors['contact.fatherPhone']}
                      onCountryCodeChange={(value) =>
                        updateField('contact.fatherCountryCode', value)
                      }
                      onPhoneChange={(value) => updatePhone('contact.fatherPhone', value)}
                    />
                    <PhoneInput
                      id="motherPhone"
                      label="Mother's Contact Number"
                      countryCode={formData.contact.motherCountryCode}
                      phone={formData.contact.motherPhone}
                      error={errors['contact.motherPhone']}
                      onCountryCodeChange={(value) =>
                        updateField('contact.motherCountryCode', value)
                      }
                      onPhoneChange={(value) => updatePhone('contact.motherPhone', value)}
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        id="address"
                        label="Address"
                        multiline
                        value={formData.contact.address}
                        onChange={(value) => updateField('contact.address', value)}
                      />
                    </div>
                  </FieldGrid>
                  <p className="mt-4 rounded-md bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-500">
                    By entering your number, you agree to receive a WhatsApp message to
                    help complete your biodata if you leave this page.
                  </p>
                </AccordionSection>

                <AccordionSection
                  value="background"
                  title="Biodata Design"
                  description="Choose the full-page template and photo corner style used in the preview and PDF."
                >
                  <label className="mb-5 block rounded-lg border border-stone-200 bg-white p-4">
                    <span className="flex items-center justify-between gap-4">
                      <span>
                        <span className="block text-sm font-semibold text-stone-900">
                          Photo corner radius
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">
                          Adjust how rounded the profile photo border should be.
                        </span>
                      </span>
                      <span className="text-sm font-bold text-amber-700">
                        {formData.design.photoRadius || '18'}px
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="1"
                      value={formData.design.photoRadius || '18'}
                      onChange={(event) =>
                        updateField('design.photoRadius', event.target.value)
                      }
                      className="mt-4 w-full accent-amber-600"
                    />
                  </label>

                  <label className="mb-5 block rounded-lg border border-stone-200 bg-white p-4">
                    <span className="flex items-center justify-between gap-4">
                      <span>
                        <span className="block text-sm font-semibold text-stone-900">
                          Text readability background
                        </span>
                        <span className="mt-1 block text-xs text-stone-500">
                          Add a soft panel behind details when the template is busy.
                        </span>
                      </span>
                      <span className="text-sm font-bold text-amber-700">
                        {formData.design.textPanelOpacity || '36'}%
                      </span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      step="1"
                      value={formData.design.textPanelOpacity || '36'}
                      onChange={(event) =>
                        updateField('design.textPanelOpacity', event.target.value)
                      }
                      className="mt-4 w-full accent-amber-600"
                    />
                  </label>

                  <p className="mb-3 text-sm font-semibold text-stone-800">
                    Background template
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {backgroundOptions.map((background) => {
                      const selected = formData.design.background === background.value

                      return (
                        <button
                          key={background.value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => updateField('design.background', background.value)}
                          className={[
                            'rounded-lg border p-3 text-left transition',
                            selected
                              ? 'border-amber-600 bg-amber-50 shadow-sm'
                              : 'border-stone-200 bg-white hover:border-amber-300',
                          ].join(' ')}
                        >
                          <span
                            className="block aspect-[3/4] w-full overflow-hidden rounded-md border border-amber-200 bg-[#fffaf0] bg-contain bg-center bg-no-repeat"
                            style={{
                              backgroundImage: background.image
                                ? `url(${background.image})`
                                : undefined,
                            }}
                            aria-hidden="true"
                          />
                          <span className="mt-2 block text-sm font-semibold text-stone-950">
                            {background.label}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-stone-500">
                            {background.description}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </AccordionSection>

                <AccordionSection
                  value="photo"
                  title="Photo Upload"
                  description="Add a profile photo for the final biodata."
                >
                  <PhotoUpload
                    photo={formData.photo}
                    onPhotoChange={(photo) => updateField('photo', photo)}
                  />
                </AccordionSection>
              </Accordion.Root>
            </form>
          </section>

          <aside className="xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto">
            <BiodataPreview data={formData} />
          </aside>
        </div>
      </div>
    </main>
  )
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

async function waitForPreviewAssets() {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const preview = document.getElementById('biodata-preview')
  const images = Array.from(preview?.querySelectorAll('img') ?? [])

  await Promise.all(
    images.map(
      (image) =>
        waitForImage(image).then(() =>
          image.decode ? image.decode().catch(() => undefined) : undefined,
        ),
    ),
  )

  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

function waitForImage(image: HTMLImageElement) {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve()

  return new Promise<void>((resolve) => {
    image.addEventListener('load', () => resolve(), { once: true })
    image.addEventListener('error', () => resolve(), { once: true })
  })
}

async function applyExportFit(preview: HTMLElement) {
  preview.classList.remove('export-compact', 'export-ultra-compact')

  await nextFrame()
  if (preview.scrollHeight <= preview.clientHeight) return

  preview.classList.add('export-compact')

  await nextFrame()
  if (preview.scrollHeight <= preview.clientHeight) return

  preview.classList.add('export-ultra-compact')
  await nextFrame()
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

async function inlinePreviewImages(preview: HTMLElement) {
  const images = Array.from(preview.querySelectorAll('img'))
  const previousSources = new Map<HTMLImageElement, string>()
  const restorers: Array<() => void> = []

  await Promise.all(
    images.map(async (image) => {
      const src = image.currentSrc || image.src
      if (!src || src.startsWith('data:')) return

      try {
        const dataUrl = await imageUrlToDataUrl(src)
        previousSources.set(image, image.src)
        image.src = dataUrl
        restorers.push(applyImageFallback(image, dataUrl))
      } catch {
        // Keep the original URL if the browser refuses conversion.
      }
    }),
  )

  await waitForPreviewAssets()

  return () => {
    previousSources.forEach((src, image) => {
      image.src = src
    })
    restorers.forEach((restore) => restore())
  }
}

function applyImageFallback(image: HTMLImageElement, dataUrl: string) {
  const target =
    image.classList.contains('biodata-background-image') ||
    image.closest('.photo-frame')
      ? (image.parentElement as HTMLElement | null)
      : null

  if (!target) return () => undefined

  const previousBackgroundImage = target.style.backgroundImage
  const previousBackgroundSize = target.style.backgroundSize
  const previousBackgroundPosition = target.style.backgroundPosition
  const previousBackgroundRepeat = target.style.backgroundRepeat
  const previousOpacity = image.style.opacity

  target.style.backgroundImage = `url(${dataUrl})`
  target.style.backgroundSize = image.classList.contains('biodata-background-image')
    ? '100% 100%'
    : 'cover'
  target.style.backgroundPosition = 'center'
  target.style.backgroundRepeat = 'no-repeat'
  image.style.opacity = '0'

  return () => {
    target.style.backgroundImage = previousBackgroundImage
    target.style.backgroundSize = previousBackgroundSize
    target.style.backgroundPosition = previousBackgroundPosition
    target.style.backgroundRepeat = previousBackgroundRepeat
    image.style.opacity = previousOpacity
  }
}

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url, { cache: 'force-cache' })
  const blob = await response.blob()

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function loadDraft(): BiodataForm {
  if (typeof window === 'undefined') return emptyBiodataForm

  try {
    const raw = window.localStorage.getItem(draftKey)
    if (!raw) return emptyBiodataForm
    return normalizeForm(mergeForm(emptyBiodataForm, JSON.parse(raw)) as BiodataForm)
  } catch {
    return emptyBiodataForm
  }
}

function normalizeForm(data: BiodataForm): BiodataForm {
  const backgroundExists = backgroundOptions.some(
    (option) => option.value === data.design.background,
  )

  if (backgroundExists) return data

  return {
    ...data,
    design: {
      ...data.design,
      background: getDefaultBackground(),
    },
  }
}

function validateForm(data: BiodataForm): FieldErrors {
  const nextErrors: FieldErrors = {}

  for (const [path, message] of requiredFields) {
    if (!String(getValue(data, path) ?? '').trim()) {
      nextErrors[path] = message
    }
  }

  if (data.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
    nextErrors['contact.email'] = 'Enter a valid email address.'
  }

  validatePhone(data.contact.phone, 'contact.phone', nextErrors, true)
  validatePhone(data.contact.fatherPhone, 'contact.fatherPhone', nextErrors)
  validatePhone(data.contact.motherPhone, 'contact.motherPhone', nextErrors)

  if (data.personal.dob) {
    const dob = new Date(`${data.personal.dob}T00:00:00`)
    const today = new Date()
    if (Number.isNaN(dob.getTime())) {
      nextErrors['personal.dob'] = 'Enter a valid date of birth.'
    } else if (dob > today) {
      nextErrors['personal.dob'] = 'Date of birth cannot be in the future.'
    } else if (calculateAge(dob, today) < 18) {
      nextErrors['personal.dob'] = 'Age must be at least 18 years.'
    }
  }

  return nextErrors
}

function validatePhone(
  value: string,
  path: string,
  errors: FieldErrors,
  required = false,
) {
  if (!value && !required) return
  if (!/^\d+$/.test(value)) {
    errors[path] = 'Phone number must contain digits only.'
    return
  }
  if (value.length < 7 || value.length > 15) {
    errors[path] = 'Phone number must be 7 to 15 digits.'
  }
}

function calculateAge(dob: Date, today: Date) {
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

function trimForm<T>(value: T): T {
  if (typeof value === 'string') return value.trim() as T
  if (Array.isArray(value)) return value.map(trimForm) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, trimForm(nested)]),
    ) as T
  }
  return value
}

function getValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return undefined
    return (current as Record<string, unknown>)[key]
  }, source)
}

function setValue<T>(source: T, path: string, value: string): T {
  const keys = path.split('.')
  const clone = structuredClone(source)
  let cursor = clone as Record<string, unknown>

  keys.slice(0, -1).forEach((key) => {
    cursor = cursor[key] as Record<string, unknown>
  })

  cursor[keys[keys.length - 1]] = value
  return clone
}

function mergeForm(base: unknown, draft: unknown): unknown {
  if (draft === undefined || draft === null) return base
  if (!base || typeof base !== 'object' || typeof draft !== 'object') return draft

  return Object.fromEntries(
    Object.entries(base).map(([key, value]) => [
      key,
      mergeForm(value, (draft as Record<string, unknown>)[key]),
    ]),
  )
}
