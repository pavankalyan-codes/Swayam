import * as Accordion from '@radix-ui/react-accordion'
import { useForm } from '@tanstack/react-form'
import { FileImage, FileText, Sparkles, RotateCcw, Eye, X, Share2 } from 'lucide-react'
import { toJpeg } from 'html-to-image'
import jsPDF from 'jspdf'
import React, { useEffect, useMemo, useState, useRef, type ReactNode } from 'react'
import { useI18n } from './i18n'
import { LanguageSelector } from './components/LanguageSelector'
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
  const [compaction, setCompaction] = useState<'normal' | 'compact' | 'ultra-compact'>('normal')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { t } = useI18n()

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

    // Live calculation of content compaction to ensure the preview matches the export fit
    const calculateCompaction = async () => {
      const preview = document.getElementById('biodata-preview')
      if (!preview) return

      setCompaction('normal')
      await nextFrame()
      if (preview.scrollHeight <= 1123) return

      setCompaction('compact')
      await nextFrame()
      if (preview.scrollHeight <= 1123) return

      setCompaction('ultra-compact')
    }

    if (draftReady) {
      const timer = setTimeout(calculateCompaction, 100)
      return () => clearTimeout(timer)
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

    const preview = getPreviewElement()
    if (preview) {
      await waitForPreviewAssets(preview)
    }
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
    const preview = getPreviewElement()
    if (!preview) throw new Error('Biodata preview was not found.')

    const { clone, wrapper, remove } = createExportPreviewClone(preview)
    document.body.appendChild(wrapper)
    clone.classList.add('export-canvas')
    const restoreImages = await inlinePreviewImages(clone)

    try {
      await waitForPreviewAssets(clone)
      await applyExportFit(clone)

      return await toJpeg(clone, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#fcfdff',
        height: 1123,
        width: 794,
      })
    } finally {
      restoreImages()
      remove()
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
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_biodata', {
          method: 'jpeg',
        })
      }
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
      const pdf = await createPdfFromJpeg(jpeg)
      pdf.save(`${fileBaseName(data)}.pdf`)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'generate_biodata', {
          method: 'pdf',
        })
      }
    } finally {
      setExporting(null)
    }
  }

  async function sharePdf() {
    setExporting('pdf')
    try {
      const data = await prepareExport()
      if (!data) return

      const jpeg = await capturePreview()
      const pdf = await createPdfFromJpeg(jpeg)

      const pdfBlob = pdf.output('blob')
      const fileName = `${fileBaseName(data)}.pdf`
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' })

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: t('marriageBiodata'),
          text: t('tagline'),
        })
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'share_biodata', {
            method: 'native_share',
          })
        }
      } else {
        alert('Sharing files is not supported on this browser. Try downloading the PDF instead.')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error sharing PDF:', err)
      }
    } finally {
      setExporting(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-stone-950 pb-24 xl:pb-0">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="no-print mb-6 flex flex-col gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between animate-fade-in-up">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9F1239] sm:text-sm">
                {t('label')}
              </p>
              <div className="ml-auto">
                <LanguageSelector />
              </div>
            </div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-stone-950 sm:text-5xl brand-heading">
              {t('swayam')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm brand-tagline sm:text-base">
              {t('tagline')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="glossy-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 transition-all hover:scale-[1.02] active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              {t('clearForm')}
            </button>
            <button
              type="button"
              onClick={useSampleData}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100 px-4 py-2.5 text-sm font-bold text-rose-900 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              {t('trySample')}
            </button>
            <button
              type="button"
              onClick={sharePdf}
              disabled={Boolean(exporting)}
              className="glossy-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 className="h-4 w-4" />
              {exporting === 'pdf' ? '...' : t('sharePdf')}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="glossy-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Eye className="h-4 w-4" />
              {t('preview')}
            </button>
            <button
              type="button"
              onClick={() => tanstackForm.handleSubmit()}
              disabled={Boolean(exporting)}
              className="glossy-button-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {exporting === 'pdf' ? 'Saving PDF...' : t('savePdf')}
            </button>
            <button
              type="button"
              onClick={exportJpeg}
              disabled={Boolean(exporting)}
              className="glossy-button-secondary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-800 transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileImage className="h-4 w-4" />
              {exporting === 'jpeg' ? 'Saving JPEG...' : 'Download JPEG'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,650px)_minmax(620px,1fr)]">
          <section className="no-print">
            <div className="glossy-surface mb-6 rounded-2xl border border-rose-200/50 p-5 shadow-xl animate-fade-in-up" style={{ animationDelay: '50ms' }}>
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black tracking-tight text-stone-800 uppercase">
                  {t('requiredFieldsCompleted')}
                </p>
                <p className="rounded-full bg-[#9F1239] px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-rose-600/20">
                  {Math.round((filledRequiredCount / requiredTotal) * 100)}%
                </p>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-stone-200/50">
                <div
                  className="progress-glow h-full rounded-full bg-gradient-to-r from-rose-500 via-[#9F1239] to-rose-700 transition-all duration-700 ease-out"
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
                className="space-y-4 accordion-stagger-container"
              >
                <AccordionSection
                  value="personal"
                  title={t('personalDetails')}
                  description={t('personalDescription')}
                >
                  <FieldGrid>
                    <FormInput
                      id="firstName"
                      label={t('firstName')}
                      required
                      value={formData.personal.firstName}
                      error={errors['personal.firstName']}
                      onChange={(value) => updateField('personal.firstName', value)}
                    />
                    <FormInput
                      id="lastName"
                      label={t('lastName')}
                      required
                      value={formData.personal.lastName}
                      error={errors['personal.lastName']}
                      onChange={(value) => updateField('personal.lastName', value)}
                    />
                    <FormSelect
                      id="gender"
                      label={t('gender')}
                      required
                      options={genderOptions}
                      value={formData.personal.gender}
                      error={errors['personal.gender']}
                      onChange={(value) => updateField('personal.gender', value)}
                    />
                    <FormInput
                      id="dob"
                      type="date"
                      label={t('dob')}
                      required
                      value={formData.personal.dob}
                      error={errors['personal.dob']}
                      onChange={(value) => updateField('personal.dob', value)}
                    />
                    <FormInput
                      id="placeOfBirth"
                      label={t('placeOfBirth')}
                      value={formData.personal.placeOfBirth}
                      onChange={(value) => updateField('personal.placeOfBirth', value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <FormSelect
                        id="birthHour"
                        label={t('hour')}
                        options={hourOptions}
                        value={formData.personal.timeOfBirth.hour}
                        onChange={(value) => updateField('personal.timeOfBirth.hour', value)}
                      />
                      <FormSelect
                        id="birthMinute"
                        label={t('minute')}
                        options={minuteOptions}
                        value={formData.personal.timeOfBirth.minute}
                        onChange={(value) => updateField('personal.timeOfBirth.minute', value)}
                      />
                      <FormSelect
                        id="birthMeridiem"
                        label={t('meridiem')}
                        options={meridiemOptions}
                        value={formData.personal.timeOfBirth.meridiem}
                        onChange={(value) => updateField('personal.timeOfBirth.meridiem', value)}
                      />
                    </div>
                    <FormInput
                      id="height"
                      label={t('height')}
                      required
                      placeholder="5 ft 8 in"
                      value={formData.personal.height}
                      error={errors['personal.height']}
                      onChange={(value) => updateField('personal.height', value)}
                    />
                    <FormSelect
                      id="maritalStatus"
                      label={t('maritalStatus')}
                      required
                      options={maritalStatusOptions}
                      value={formData.personal.maritalStatus}
                      error={errors['personal.maritalStatus']}
                      onChange={(value) => updateField('personal.maritalStatus', value)}
                    />
                    <FormInput
                      id="religion"
                      label={t('religion')}
                      required
                      value={formData.personal.religion}
                      error={errors['personal.religion']}
                      onChange={(value) => updateField('personal.religion', value)}
                    />
                    <FormInput
                      id="motherTongue"
                      label={t('motherTongue')}
                      value={formData.personal.motherTongue}
                      onChange={(value) => updateField('personal.motherTongue', value)}
                    />
                    <FormInput
                      id="community"
                      label={t('community')}
                      required
                      value={formData.personal.community}
                      error={errors['personal.community']}
                      onChange={(value) => updateField('personal.community', value)}
                    />
                    <FormSelect
                      id="diet"
                      label={t('diet')}
                      required
                      options={dietOptions}
                      value={formData.personal.diet}
                      error={errors['personal.diet']}
                      onChange={(value) => updateField('personal.diet', value)}
                    />
                    <FormInput
                      id="complexion"
                      label={t('complexion')}
                      value={formData.personal.complexion}
                      onChange={(value) => updateField('personal.complexion', value)}
                    />
                    <FormInput
                      id="livingIn"
                      label={t('livingIn')}
                      required
                      value={formData.personal.livingIn}
                      error={errors['personal.livingIn']}
                      onChange={(value) => updateField('personal.livingIn', value)}
                    />
                    <FormInput
                      id="state"
                      label={t('state')}
                      required
                      value={formData.personal.state}
                      error={errors['personal.state']}
                      onChange={(value) => updateField('personal.state', value)}
                    />
                    <FormInput
                      id="city"
                      label={t('city')}
                      required
                      value={formData.personal.city}
                      error={errors['personal.city']}
                      onChange={(value) => updateField('personal.city', value)}
                    />
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="career"
                  title={t('educationCareer')}
                  description={t('careerDescription')}
                >
                  <FieldGrid>
                    <FormInput
                      id="highestQualification"
                      label={t('qualification')}
                      required
                      value={formData.career.highestQualification}
                      error={errors['career.highestQualification']}
                      onChange={(value) => updateField('career.highestQualification', value)}
                    />
                    <FormInput
                      id="collegeName"
                      label={t('college')}
                      required
                      value={formData.career.collegeName}
                      error={errors['career.collegeName']}
                      onChange={(value) => updateField('career.collegeName', value)}
                    />
                    <FormSelect
                      id="workSector"
                      label={t('workSector')}
                      required
                      options={workSectorOptions}
                      value={formData.career.workSector}
                      error={errors['career.workSector']}
                      onChange={(value) => updateField('career.workSector', value)}
                    />
                    <FormInput
                      id="occupation"
                      label={t('occupation')}
                      required
                      value={formData.career.occupation}
                      error={errors['career.occupation']}
                      onChange={(value) => updateField('career.occupation', value)}
                    />
                    <FormInput
                      id="companyName"
                      label={t('company')}
                      required
                      value={formData.career.companyName}
                      error={errors['career.companyName']}
                      onChange={(value) => updateField('career.companyName', value)}
                    />
                    <FormInput
                      id="annualIncome"
                      label={t('annualIncome')}
                      required
                      value={formData.career.annualIncome}
                      error={errors['career.annualIncome']}
                      onChange={(value) => updateField('career.annualIncome', value)}
                    />
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="family"
                  title={t('familyDetails')}
                  description={t('familyDescription')}
                >
                  <FieldGrid>
                    <FormInput
                      id="fatherName"
                      label={t('fatherName')}
                      value={formData.family.fatherName}
                      onChange={(value) => updateField('family.fatherName', value)}
                    />
                    <FormInput
                      id="fatherOccupation"
                      label={t('fatherOccupation')}
                      value={formData.family.fatherOccupation}
                      onChange={(value) => updateField('family.fatherOccupation', value)}
                    />
                    <FormInput
                      id="motherName"
                      label={t('motherName')}
                      value={formData.family.motherName}
                      onChange={(value) => updateField('family.motherName', value)}
                    />
                    <FormInput
                      id="motherOccupation"
                      label={t('motherOccupation')}
                      value={formData.family.motherOccupation}
                      onChange={(value) => updateField('family.motherOccupation', value)}
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        id="siblings"
                        label={t('siblings')}
                        placeholder="Example: One elder sister, married"
                        value={formData.family.siblings}
                        onChange={(value) => updateField('family.siblings', value)}
                      />
                    </div>
                  </FieldGrid>
                </AccordionSection>

                <AccordionSection
                  value="contact"
                  title={t('contactInformation')}
                  description={t('contactDescription')}
                >
                  <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
                    <PhoneInput
                      id="phone"
                      label={t('contactNumber')}
                      required
                      className="md:col-span-2"
                      countryCode={formData.contact.countryCode}
                      phone={formData.contact.phone}
                      error={errors['contact.phone']}
                      onCountryCodeChange={(value) => updateField('contact.countryCode', value)}
                      onPhoneChange={(value) => updatePhone('contact.phone', value)}
                    />
                    <FormInput
                      id="email"
                      type="email"
                      label={t('emailId')}
                      required
                      className="md:col-span-2"
                      value={formData.contact.email}
                      error={errors['contact.email']}
                      onChange={(value) => updateField('contact.email', value)}
                    />
                    <PhoneInput
                      id="fatherPhone"
                      label={t('fatherContact')}
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
                      label={t('motherContact')}
                      countryCode={formData.contact.motherCountryCode}
                      phone={formData.contact.motherPhone}
                      error={errors['contact.motherPhone']}
                      onCountryCodeChange={(value) =>
                        updateField('contact.motherCountryCode', value)
                      }
                      onPhoneChange={(value) => updatePhone('contact.motherPhone', value)}
                    />
                    <FormInput
                      id="address"
                      label={t('address')}
                      multiline
                      className="md:col-span-2"
                      value={formData.contact.address}
                      onChange={(value) => updateField('contact.address', value)}
                    />
                  </div>
                  <p className="mt-5 rounded-md bg-stone-50 px-3 py-2.5 text-xs leading-5 text-stone-500">
                    {t('whatsappConsent')}
                  </p>
                </AccordionSection>

                <AccordionSection
                  value="background"
                  title={t('biodataDesign')}
                  description={t('designDescription')}
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
                      <span className="text-sm font-bold text-[#9F1239]">
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
                      className="mt-4 w-full accent-[#534AB7]"
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
                      <span className="text-sm font-bold text-[#9F1239]">
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
                      className="mt-4 w-full accent-[#534AB7]"
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
                            'group relative rounded-xl border p-3 text-left transition-all hover:scale-[1.03] active:scale-95',
                            selected
                              ? 'border-rose-500 bg-rose-50/50 shadow-md ring-2 ring-rose-500/20'
                              : 'border-stone-200 bg-white hover:border-rose-300',
                          ].join(' ')}
                        >
                          <span
                            className="block aspect-[3/4] w-full overflow-hidden rounded-md border border-rose-200 bg-rose-50/30 bg-contain bg-center bg-no-repeat"
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

          <aside className="xl:sticky xl:top-6 xl:self-start xl:max-h-[calc(100vh-5rem)] xl:overflow-y-auto rounded-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="preview-container !bg-transparent !p-0">
              <PreviewScaler minScale={0.6}>
                <BiodataPreview data={formData} compaction={compaction} />
              </PreviewScaler>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Navigation */}
      <div className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200/50 p-4 glossy-surface xl:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="flex-1">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[10px] font-black tracking-tight text-stone-800 uppercase">
                Progress
              </p>
              <p className="text-[10px] font-black text-rose-700">
                {Math.round((filledRequiredCount / requiredTotal) * 100)}%
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-stone-200/50">
              <div
                className="progress-glow h-full rounded-full bg-gradient-to-r from-rose-500 via-[#9F1239] to-rose-700 transition-all duration-700 ease-out"
                style={{ width: `${(filledRequiredCount / requiredTotal) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="glossy-button-secondary inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => tanstackForm.handleSubmit()}
              disabled={Boolean(exporting)}
              className="glossy-button-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {exporting === 'pdf' ? '...' : t('savePdf')}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal Overlay */}
      {isPreviewOpen && (
        <div
          className="no-print fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setIsPreviewOpen(false)}
        >
          <div className="animate-fade-in-up relative flex h-full max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/40 bg-[#f8f4ec] shadow-2xl">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-stone-200 bg-[#f8f4ec]/80 p-4 backdrop-blur-md">
              <h2 className="text-xl font-black tracking-tight text-stone-900 uppercase">
                {t('preview')}
              </h2>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-full bg-stone-200/50 p-2 text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-all active:scale-95"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-10">
              <div className="preview-container">
                <PreviewScaler minScale={0.4}>
                  <BiodataPreview data={formData} compaction={compaction} />
                </PreviewScaler>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

/**
 * Fits a fixed-width A4 preview (794px) into any container width using CSS scale.
 * This prevents the preview from appearing "enlarged" on desktop or clipping on mobile.
 */
function PreviewScaler({ children, minScale = 0.5 }: { children: ReactNode; minScale?: number }) {
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState(1123)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      if (containerWidth <= 0) return

      const fitScale = containerWidth / 794
      const newScale = Math.max(minScale, Math.min(1, fitScale))
      setScale(newScale)

      const previewEl = document.getElementById('biodata-preview')
      if (previewEl) {
        setContentHeight(previewEl.scrollHeight)
      }
    }

    // Ensure initial scale is correct after layout settles
    const timer = setTimeout(handleResize, 100)

    handleResize()
    window.addEventListener('resize', handleResize)

    const observer = new MutationObserver(handleResize)
    const previewEl = document.getElementById('biodata-preview')
    if (previewEl) {
      observer.observe(previewEl, { childList: true, subtree: true, characterData: true })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [minScale, children])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: `${contentHeight * scale}px` }}
    >
      <div 
        style={{ 
          left: '50%',
          position: 'absolute',
          top: 0,
          transform: `translateX(-50%) scale(${scale})`, 
          transformOrigin: 'top center',
          width: '794px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>
}

async function createPdfFromJpeg(jpegDataUrl: string) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: false,
  })
  const imageBytes = await dataUrlToUint8Array(jpegDataUrl)

  pdf.addImage({
    imageData: imageBytes,
    format: 'JPEG',
    x: 0,
    y: 0,
    width: 210,
    height: 297,
    compression: 'NONE',
  })

  return pdf
}

async function dataUrlToUint8Array(dataUrl: string) {
  const response = await fetch(dataUrl)
  const buffer = await response.arrayBuffer()
  return new Uint8Array(buffer)
}

function getPreviewElement() {
  const previews = Array.from(document.querySelectorAll<HTMLElement>('#biodata-preview'))
  return previews.find((preview) => preview.offsetParent !== null) ?? previews[0] ?? null
}

function createExportPreviewClone(preview: HTMLElement) {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('aria-hidden', 'true')
  Object.assign(wrapper.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '794px',
    height: '1123px',
    overflow: 'hidden',
    pointerEvents: 'none',
    transform: 'none',
    zIndex: '-1',
  })

  const clone = preview.cloneNode(true) as HTMLElement
  clone.id = 'biodata-preview-export'
  Object.assign(clone.style, {
    margin: '0',
    transform: 'none',
  })

  wrapper.appendChild(clone)

  return {
    clone,
    wrapper,
    remove: () => wrapper.remove(),
  }
}

async function waitForPreviewAssets(root: ParentNode) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }

  const images = Array.from(root.querySelectorAll('img'))

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

  await waitForPreviewAssets(preview)

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
