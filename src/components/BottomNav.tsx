import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { useTranslation } from '../i18n/LocaleContext'

export type AppTab = 'home' | 'card' | 'grid' | 'crop'

interface BottomNavProps {
  active: AppTab
  onSelect: (tab: AppTab) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  const t = useTranslation()
  const tabs: { id: AppTab; label: string; disabled?: boolean }[] = [
    { id: 'home', label: t.bottomNav.home },
    { id: 'card', label: t.bottomNav.card },
    { id: 'grid', label: t.bottomNav.grid },
    { id: 'crop', label: t.bottomNav.crop, disabled: true },
  ]

  return (
    <Tabs
      value={active}
      onValueChange={(value) => onSelect(value as AppTab)}
      className="mt-6 border-t border-outline-variant px-4 pt-3 pb-3"
    >
      <TabsList className="h-auto w-full bg-transparent p-0">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled} className="flex-1 py-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
