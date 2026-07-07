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
    <section className="mx-auto w-full max-w-[1140px] px-5 pt-6 pb-6 sm:px-8 sm:pt-8">
      <Tabs value={active} onValueChange={(value) => onSelect(value as CardSubTab)} className="flex-col gap-5">
        <TabsList className="h-auto w-full bg-surface-container-low p-1.5 sm:w-fit">
          {subTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="min-h-10 px-4 py-2 sm:min-w-24">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value={active}
          className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 sm:p-7"
        >
          {props[PANEL_KEYS[active]]}
        </TabsContent>
      </Tabs>
    </section>
  )
}
