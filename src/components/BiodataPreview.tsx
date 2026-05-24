import type { BiodataForm } from '../types/biodata'
import type { CSSProperties, ReactNode } from 'react'
import { getBackgroundImage } from '../data/backgrounds'
import { PreviewRow } from './PreviewRow'
import { useI18n } from '../i18n'
import { cn } from '../lib/utils'

type BiodataPreviewProps = {
  data: BiodataForm
  compaction?: 'compact' | 'ultra-compact' | 'normal'
}

function fullName(data: BiodataForm) {
  return [data.personal.firstName, data.personal.lastName].filter(Boolean).join(' ')
}

function birthTime(data: BiodataForm) {
  const { hour, minute, meridiem } = data.personal.timeOfBirth
  if (!hour || !minute || !meridiem) return ''
  return `${hour}:${minute} ${meridiem}`
}

function phone(countryCode: string, value: string) {
  return value ? `${countryCode} ${value}` : ''
}

function sectionHasValues(values: Array<string>) {
  return values.some((value) => value.trim())
}

export function BiodataPreview({ data, compaction }: BiodataPreviewProps) {
  const { t, lang } = useI18n()
  const isRtl = lang === 'ur'

  const hasStarted = Boolean(
    fullName(data) ||
      data.personal.dob ||
      data.career.highestQualification ||
      data.contact.phone ||
      data.contact.email,
  )
  const name = fullName(data) || ''
  const backgroundImage = getBackgroundImage(data.design.background)
  const textPanelOpacity = Math.min(
    0.9,
    Math.max(0, Number(data.design.textPanelOpacity || 36) / 100),
  )
  const familyValues = [
    data.family.fatherName,
    data.family.fatherOccupation,
    data.family.motherName,
    data.family.motherOccupation,
    data.family.siblings,
  ]

  return (
    <article
      id="biodata-preview"
      data-border-theme={data.design.borderTheme}
      data-background={data.design.background}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={[
        'print-area relative mx-auto rounded-lg border-2 border-[#9F1239] bg-[#fcfdff] text-stone-950 shadow-xl shadow-rose-950/10',
        compaction === 'compact' ? 'export-compact' : '',
        compaction === 'ultra-compact' ? 'export-ultra-compact' : '',
      ].join(' ')}
      style={
        {
          '--text-panel-bg': `rgba(252, 253, 255, ${textPanelOpacity})`,
        } as CSSProperties
      }
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt=""
          aria-hidden="true"
          crossOrigin="anonymous"
          className="biodata-background-image"
        />
      ) : null}
      <BorderDecorations />

      <div className="preview-title relative z-10 px-7 pb-3">
        <p className="inline-flex rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9F1239]">
          {t('marriageBiodata')}
        </p>
      </div>

      <div className="preview-hero relative z-10 grid gap-5 p-5 md:grid-cols-[1fr_132px]">
        <div>
          <PreviewSection title={t('personalDetails')}>
            <PreviewRow label={t('name')} value={name} />
            <PreviewRow label={t('dob')} value={data.personal.dob} />
            <PreviewRow label={t('gender')} value={data.personal.gender} />
            <PreviewRow label={t('birthPlace')} value={data.personal.placeOfBirth} />
            <PreviewRow label={t('birthTime')} value={birthTime(data)} />
            <PreviewRow label={t('height')} value={data.personal.height} />
            <PreviewRow label={t('maritalStatus')} value={data.personal.maritalStatus} />
            <PreviewRow label={t('religion')} value={data.personal.religion} />
            <PreviewRow label={t('motherTongue')} value={data.personal.motherTongue} />
            <PreviewRow label={t('community')} value={data.personal.community} />
            <PreviewRow label={t('diet')} value={data.personal.diet} />
            <PreviewRow label={t('complexion')} value={data.personal.complexion} />
            <PreviewRow
              label={t('location')}
              value={[data.personal.city, data.personal.state, data.personal.livingIn]
                .filter(Boolean)
                .join(', ')}
            />
          </PreviewSection>
        </div>

        <div
          className="photo-frame mx-auto h-[166px] w-[132px] overflow-hidden border-4 border-rose-200 bg-white shadow-md"
          style={{ borderRadius: `${data.design.photoRadius || '18'}px` }}
        >
          {data.photo ? (
            <img
              src={data.photo}
              alt={`${name} profile`}
              crossOrigin="anonymous"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-rose-50 to-stone-100 text-center text-sm font-medium text-rose-800">
              {t('profile')}
              <br />
              {t('photo')}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 space-y-4 px-5 pb-28">
        <PreviewSection title={t('educationCareer')}>
          <PreviewRow label={t('qualification')} value={data.career.highestQualification} />
          <PreviewRow label={t('college')} value={data.career.collegeName} />
          <PreviewRow label={t('workSector')} value={data.career.workSector} />
          <PreviewRow label={t('occupation')} value={data.career.occupation} />
          <PreviewRow label={t('company')} value={data.career.companyName} />
          <PreviewRow label={t('annualIncome')} value={data.career.annualIncome} />
        </PreviewSection>

        {sectionHasValues(familyValues) ? (
          <PreviewSection title={t('familyDetails')}>
            <PreviewRow label={t('father')} value={data.family.fatherName} />
            <PreviewRow label={t('fatherOccupation')} value={data.family.fatherOccupation} />
            <PreviewRow label={t('mother')} value={data.family.motherName} />
            <PreviewRow label={t('motherOccupation')} value={data.family.motherOccupation} />
            <PreviewRow label={t('siblings')} value={data.family.siblings} />
          </PreviewSection>
        ) : null}

        <PreviewSection title={t('contactInformation')} singleColumn>
          <PreviewRow
            label={t('contact')}
            value={phone(data.contact.countryCode, data.contact.phone)}
          />
          <PreviewRow label={t('email')} value={data.contact.email} />
          <PreviewRow
            label={t('fatherContact')}
            value={phone(data.contact.fatherCountryCode, data.contact.fatherPhone)}
          />
          <PreviewRow
            label={t('motherContact')}
            value={phone(data.contact.motherCountryCode, data.contact.motherPhone)}
          />
          <PreviewRow label={t('address')} value={data.contact.address} />
        </PreviewSection>
      </div>

      {!hasStarted ? (
        <div className="pointer-events-none absolute inset-x-8 top-[34%] z-10 rounded-lg border border-rose-200 bg-white/88 px-5 py-4 text-center shadow-sm">
          <p className="font-serif text-2xl font-bold text-[#9F1239]">
            {t('previewPlaceholderTitle')}
          </p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {t('previewPlaceholderDesc')}
          </p>
        </div>
      ) : null}
    </article>
  )
}

function BorderDecorations() {
  return (
    <div className="biodata-border-art" aria-hidden="true">
      <span className="border-curve border-curve-tl" />
      <span className="border-curve border-curve-tr" />
      <span className="border-curve border-curve-bl" />
      <span className="border-curve border-curve-br" />
      <span className="divine-medallion medallion-a">
        <DivineIcon kind="jesus" />
        <span>Jesus</span>
      </span>
      <span className="divine-medallion medallion-b">
        <DivineIcon kind="vinayaka" />
        <span>Vinayaka</span>
      </span>
      <span className="divine-medallion medallion-c">
        <DivineIcon kind="vishnu" />
        <span>Vishnu</span>
      </span>
      <span className="divine-medallion medallion-d">
        <DivineIcon kind="shiva-parvati" />
        <span>Shiva Parvati</span>
      </span>
    </div>
  )
}

function DivineIcon({
  kind,
}: {
  kind: 'jesus' | 'vinayaka' | 'vishnu' | 'shiva-parvati'
}) {
  if (kind === 'jesus') {
    return (
      <svg className="medallion-icon" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="16" r="8" />
        <path d="M13 42c2-11 20-11 22 0" />
        <path d="M24 6v20M17 13h14" />
      </svg>
    )
  }

  if (kind === 'vinayaka') {
    return (
      <svg className="medallion-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M15 19c0-8 18-8 18 0" />
        <path d="M17 20c-6 2-6 10 0 11" />
        <path d="M31 20c6 2 6 10 0 11" />
        <path d="M24 17c-7 5-4 16 2 18 4 1 6-3 3-6" />
        <path d="M18 11l-4-5M30 11l4-5" />
      </svg>
    )
  }

  if (kind === 'vishnu') {
    return (
      <svg className="medallion-icon" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M13 20l5-11 6 8 6-8 5 11" />
        <circle cx="24" cy="24" r="8" />
        <path d="M14 42c3-10 17-10 20 0" />
        <path d="M37 14c5 1 5 8 0 9" />
      </svg>
    )
  }

  return (
    <svg className="medallion-icon" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M16 23c2-9 14-9 16 0" />
      <path d="M11 42c2-11 24-11 26 0" />
      <path d="M37 7v19M32 12h10M34 7l3 5 3-5" />
      <path d="M18 9c-5 4-2 10 4 10" />
      <path d="M29 12c3 1 5 4 5 8" />
    </svg>
  )
}

function PreviewSection({
  title,
  children,
  singleColumn,
}: {
  title: string
  children: ReactNode
  singleColumn?: boolean
}) {
  return (
    <section className="preview-section break-inside-avoid rounded-md p-2">
      <h3 className="mb-2 border-b-2 border-rose-300 pb-1.5 font-serif text-lg font-bold text-[#9F1239]">
        {title}
      </h3>
      <dl
        className={cn(
          'preview-details grid grid-cols-1 gap-x-5',
          singleColumn ? 'preview-details-single' : 'sm:grid-cols-2',
        )}
      >
        {children}
      </dl>
    </section>
  )
}
