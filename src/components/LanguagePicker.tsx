import type { ColorNameLanguage } from '../templates/types'

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
    <div className="btn-group">
      {(Object.keys(LABELS) as ColorNameLanguage[]).map((language) => (
        <button key={language} className="btn" onClick={() => onSelect(language)} aria-pressed={selected === language}>
          {LABELS[language]}
        </button>
      ))}
    </div>
  )
}
