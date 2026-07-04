import { Globe } from 'lucide-react'
import { useLocale } from '../i18n/LocaleContext'
import type { UiLocale } from '../i18n/translations'
import { Button } from './ui/button'

const LABELS: Record<UiLocale, string> = {
  zh: '中',
  en: 'EN',
}

export function UiLanguagePicker() {
  const { locale, setLocale } = useLocale()
  const next: UiLocale = locale === 'zh' ? 'en' : 'zh'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLocale(next)}
      aria-label="Switch interface language"
      className="gap-1.5"
    >
      <Globe aria-hidden="true" size={14} />
      {LABELS[locale]}
    </Button>
  )
}
