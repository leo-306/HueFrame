import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { useTranslation } from '../i18n/LocaleContext'
import { SwatchBook, Grid3X3, Crop } from 'lucide-react'

export type AppTab = 'home' | 'card' | 'grid' | 'crop'

interface BottomNavProps {
  active: AppTab
  onSelect: (tab: AppTab) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  const t = useTranslation()
  const tabs = [
    { id: 'card' as const, label: t.bottomNav.card, icon: SwatchBook },
    { id: 'grid' as const, label: t.bottomNav.grid, icon: Grid3X3 },
    { id: 'crop' as const, label: t.bottomNav.crop, icon: Crop, disabled: true },
  ]

  return (
    <nav
      aria-label="工具导航"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/25 bg-white shadow-[0_-8px_30px_rgba(67,72,70,0.06)]"
    >
      <Tabs
        value={active}
        onValueChange={(value) => onSelect(value as AppTab)}
        className="mx-auto w-full max-w-[1140px] px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      >
        <TabsList className="h-auto w-full bg-transparent p-0">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                disabled={tab.disabled}
                className="type-caption h-14 flex-1 flex-col gap-1 rounded-2xl py-1.5 text-on-surface-variant data-[state=active]:bg-primary-container/70 data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={1.7} />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </nav>
  )
}
