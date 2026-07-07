import { UiLanguagePicker } from './UiLanguagePicker'
import { useTranslation } from '../i18n/LocaleContext'

interface TopBarProps {
  onHome?: () => void
  tabs?: React.ReactNode
}

export function TopBar({ onHome, tabs }: TopBarProps) {
  const t = useTranslation()
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant/20 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1140px] items-center gap-2 px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <h1 className="m-0 truncate text-[30px] leading-none tracking-[0.08em] text-outline sm:text-[36px]">
            {onHome ? (
              <button
                type="button"
                onClick={onHome}
                className="hueframe-brand-link cursor-pointer border-0 bg-transparent p-0 text-inherit"
              >
                <span className="hueframe-brand">{t.topBar.title}</span>
              </button>
            ) : (
              <span className="hueframe-brand">{t.topBar.title}</span>
            )}
          </h1>
        </div>

        <div className="flex shrink-0 justify-center">{tabs}</div>

        <div className="ml-auto flex shrink-0 justify-end">
          <UiLanguagePicker />
        </div>
      </div>
    </header>
  )
}
