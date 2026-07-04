import { LanguagePicker } from './LanguagePicker'
import { UiLanguagePicker } from './UiLanguagePicker'
import type { ColorNameLanguage } from '../templates/types'

interface TopBarProps {
  language: ColorNameLanguage
  onLanguageChange: (language: ColorNameLanguage) => void
}

export function TopBar({ language, onLanguageChange }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between px-5">
      <h1 className="m-0 text-[28px] leading-[1.3] tracking-[0.1em] text-primary">HueFrame</h1>
      <div className="flex items-center gap-2">
        <UiLanguagePicker />
        <LanguagePicker selected={language} onSelect={onLanguageChange} />
      </div>
    </header>
  )
}
