import type { ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs'
import { useTranslation } from '../i18n/LocaleContext'

export type CardSubTab = 'filter' | 'layout' | 'palette' | 'info'

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
  const t = useTranslation()
  const subTabs: { id: CardSubTab; label: string }[] = [
    { id: 'filter', label: t.cardTabs.filter },
    { id: 'layout', label: t.cardTabs.layout },
    { id: 'palette', label: t.cardTabs.palette },
    { id: 'info', label: t.cardTabs.info },
  ]
  return (
    <Tabs value={active} onValueChange={(value) => onSelect(value as CardSubTab)} className="flex-col px-5">
      <TabsList className="my-5 h-auto w-full bg-surface-container-low p-1">
        {subTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="py-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={active} className="pb-4">
        {props[PANEL_KEYS[active]]}
      </TabsContent>
    </Tabs>
  )
}
