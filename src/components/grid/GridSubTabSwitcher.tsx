import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { useTranslation } from '../../i18n/LocaleContext'
import type { GridSubTab } from './GridTool'

interface GridSubTabSwitcherProps {
  value: GridSubTab
  onChange: (value: GridSubTab) => void
}

export function GridSubTabSwitcher({ value, onChange }: GridSubTabSwitcherProps) {
  const t = useTranslation()
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as GridSubTab)}>
      <TabsList className="h-8 min-w-28 rounded-full border-0 bg-surface-container-high p-0.5 shadow-none">
        <TabsTrigger
          value="split"
          className="h-full rounded-full px-2 py-0.5 text-sm text-on-surface-variant shadow-none data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:shadow-none"
        >
          {t.gridTool.split}
        </TabsTrigger>
        <TabsTrigger
          value="collage"
          className="h-full rounded-full px-2 py-0.5 text-sm text-on-surface-variant shadow-none data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:shadow-none"
        >
          {t.gridTool.collage}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
