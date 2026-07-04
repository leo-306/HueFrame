import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { TRANSLATIONS, type Translations, type UiLocale } from './translations'

const STORAGE_KEY = 'hueframe-ui-locale'

function readStoredLocale(): UiLocale {
  if (typeof window === 'undefined') return 'zh'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'zh'
}

interface LocaleContextValue {
  locale: UiLocale
  setLocale: (locale: UiLocale) => void
  t: Translations
}

const DEFAULT_CONTEXT_VALUE: LocaleContextValue = {
  locale: 'zh',
  setLocale: () => {},
  t: TRANSLATIONS.zh,
}

const LocaleContext = createContext<LocaleContextValue>(DEFAULT_CONTEXT_VALUE)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<UiLocale>(readStoredLocale)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale: setLocaleState, t: TRANSLATIONS[locale] }),
    [locale]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

export function useTranslation() {
  return useLocale().t
}
