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
      aria-label="切换界面语言"
      className="h-10 w-16 gap-1.5 rounded-full border-outline-variant/40 bg-surface-container-low text-sm"
    >
      <Globe aria-hidden="true" size={16} />
      {LABELS[locale]}
    </Button>
  )
}
