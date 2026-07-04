import { ArrowLeft } from 'lucide-react'
import { UiLanguagePicker } from './UiLanguagePicker'
import { useTranslation } from '../i18n/LocaleContext'
import { Button } from './ui/button'

interface TopBarProps {
  onBack?: () => void
}

export function TopBar({ onBack }: TopBarProps) {
  const t = useTranslation()
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1140px] items-center justify-between gap-2 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1 sm:gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} aria-label={t.topBar.back} className="rounded-full">
              <ArrowLeft aria-hidden="true" size={21} />
            </Button>
          )}
          <h1 className="m-0 truncate text-[30px] leading-none tracking-[0.08em] text-primary sm:text-[36px]">
            {t.topBar.title}
          </h1>
        </div>

        <div className="flex justify-end">
        <UiLanguagePicker />
        </div>
      </div>
    </header>
  )
}
