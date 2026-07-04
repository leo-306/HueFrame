import { Tabs, TabsList, TabsTrigger } from './ui/tabs'

export type AppTab = 'card' | 'grid' | 'crop'

interface TabOption {
  id: AppTab
  label: string
  disabled?: boolean
}

const TABS: TabOption[] = [
  { id: 'card', label: '卡片' },
  { id: 'grid', label: '宫格' },
  { id: 'crop', label: '裁剪', disabled: true },
]

interface BottomNavProps {
  active: AppTab
  onSelect: (tab: AppTab) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <Tabs
      value={active}
      onValueChange={(value) => onSelect(value as AppTab)}
      className="mt-6 border-t border-outline-variant px-4 pt-3 pb-3"
    >
      <TabsList className="h-auto w-full bg-transparent p-0">
        {TABS.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled} className="flex-1 py-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
