export type AppTab = 'card' | 'grid' | 'crop'

interface TabOption {
  id: AppTab
  label: string
  disabled?: boolean
}

const TABS: TabOption[] = [
  { id: 'card', label: '卡片' },
  { id: 'grid', label: '宫格', disabled: true },
  { id: 'crop', label: '裁剪', disabled: true },
]

interface BottomNavProps {
  active: AppTab
  onSelect: (tab: AppTab) => void
}

export function BottomNav({ active, onSelect }: BottomNavProps) {
  return (
    <nav>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          disabled={tab.disabled}
          aria-pressed={active === tab.id}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
