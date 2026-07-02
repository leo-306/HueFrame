import { LanguagePicker } from './LanguagePicker'
import type { ColorNameLanguage } from '../templates/types'

interface TopBarProps {
  language: ColorNameLanguage
  onLanguageChange: (language: ColorNameLanguage) => void
}

export function TopBar({ language, onLanguageChange }: TopBarProps) {
  return (
    <header className="top-bar">
      <h1>HueFrame</h1>
      <LanguagePicker selected={language} onSelect={onLanguageChange} />
    </header>
  )
}
