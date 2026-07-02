import type { ReactNode } from 'react'

export type CardSubTab = 'filter' | 'layout' | 'palette' | 'info'

const SUB_TABS: { id: CardSubTab; label: string }[] = [
  { id: 'filter', label: '滤镜' },
  { id: 'layout', label: '版式' },
  { id: 'palette', label: '调色' },
  { id: 'info', label: '信息' },
]

interface CardTabsProps {
  active: CardSubTab
  onSelect: (tab: CardSubTab) => void
  filterPanel: ReactNode
  layoutPanel: ReactNode
  palettePanel: ReactNode
  infoPanel: ReactNode
}

const PANEL_KEYS: Record<CardSubTab, 'filterPanel' | 'layoutPanel' | 'palettePanel' | 'infoPanel'> = {
  filter: 'filterPanel',
  layout: 'layoutPanel',
  palette: 'palettePanel',
  info: 'infoPanel',
}

export function CardTabs(props: CardTabsProps) {
  const { active, onSelect } = props
  return (
    <div className="card-tabs">
      <div className="card-tabs-nav">
        {SUB_TABS.map((tab) => (
          <button key={tab.id} className="btn" aria-pressed={active === tab.id} onClick={() => onSelect(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="card-tabs-panel">{props[PANEL_KEYS[active]]}</div>
    </div>
  )
}
