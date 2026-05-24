import React from 'react'
import { useI18n } from '../i18n'

export function LanguageSelector() {
  const { lang, setLang } = useI18n()

  return (
    <div className="ml-2 inline-block">
      <label className="sr-only">Language</label>
      <select
        aria-label="Language"
        value={lang}
        onChange={(e) => setLang(e.target.value as any)}
        className="rounded-md border border-stone-200 bg-white px-2 py-1 text-sm"
      >
        <option value="en">EN</option>
        <option value="hi">हिंदी</option>
        <option value="te">తెలుగు</option>
        <option value="ta">தமிழ்</option>
        <option value="kn">ಕನ್ನಡ</option>
        <option value="ml">മലയാളം</option>
        <option value="bn">বাংলা</option>
        <option value="gu">ગુજરાતી</option>
        <option value="pa">ਪੰਜਾਬੀ</option>
        <option value="or">ଓଡ଼ିଆ</option>
        <option value="ur">اردو</option>
      </select>
    </div>
  )
}
