import type { ColorNameLanguage } from '../templates/types'
import { Button } from './ui/button'

const LABELS: Record<ColorNameLanguage, string> = {
  zh: '中文',
  en: 'English',
}

interface LanguagePickerProps {
  selected: ColorNameLanguage
  onSelect: (language: ColorNameLanguage) => void
}

export function LanguagePicker({ selected, onSelect }: LanguagePickerProps) {
  return (
    <div
      role="group"
      aria-label="色名语言"
      className="inline-flex rounded-lg border border-outline-variant/40 bg-surface p-0.5"
    >
      {(Object.keys(LABELS) as ColorNameLanguage[]).map((language) => (
        <Button
          key={language}
          variant="ghost"
          size="sm"
          onClick={() => onSelect(language)}
          aria-pressed={selected === language}
          className={`h-8 min-w-20 rounded-md border-0 px-3 text-xs ${
            selected === language ? 'bg-surface-container text-on-surface shadow-none' : 'bg-transparent'
          }`}
        >
          {LABELS[language]}
        </Button>
      ))}
    </div>
  )
}
