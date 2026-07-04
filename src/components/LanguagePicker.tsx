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
    <div className="flex gap-2">
      {(Object.keys(LABELS) as ColorNameLanguage[]).map((language) => (
        <Button
          key={language}
          variant={selected === language ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onSelect(language)}
          aria-pressed={selected === language}
        >
          {LABELS[language]}
        </Button>
      ))}
    </div>
  )
}
