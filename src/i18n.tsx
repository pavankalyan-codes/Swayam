import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import en from './locales/en.json'
import hi from './locales/hi.json'
import te from './locales/te.json'
import ta from './locales/ta.json'
import kn from './locales/kn.json'
import ml from './locales/ml.json'
import bn from './locales/bn.json'
import gu from './locales/gu.json'
import pa from './locales/pa.json'
import or from './locales/or.json'
import ur from './locales/ur.json'

type LocaleKey = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml' | 'bn' | 'gu' | 'pa' | 'or' | 'ur'

const translations: Record<LocaleKey, Record<string, string>> = {
  en,
  hi,
  te,
  ta,
  kn,
  ml,
  bn,
  gu,
  pa,
  or,
  ur,
}

type I18nContextValue = {
  lang: LocaleKey
  setLang: (l: LocaleKey) => void
  t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<LocaleKey>('en')

  useEffect(() => {
    const stored = localStorage.getItem('swayam:lang') as LocaleKey | null
    if (stored && translations[stored]) {
      setLang(stored)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('swayam:lang', lang)
    }
  }, [lang])

  const t = useMemo(() => {
    return (key: string) => {
      return translations[lang][key] ?? translations['en'][key] ?? key
    }
  }, [lang])

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
