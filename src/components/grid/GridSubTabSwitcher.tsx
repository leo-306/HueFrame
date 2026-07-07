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
      <TabsList className="h-auto w-auto rounded-full border border-outline-variant/30 bg-surface-container-high p-1">
        <TabsTrigger
          value="split"
          className="h-auto rounded-full px-4 py-1.5 text-on-surface-variant data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:shadow-sm"
        >
          {t.gridTool.split}
        </TabsTrigger>
        <TabsTrigger
          value="collage"
          className="h-auto rounded-full px-4 py-1.5 text-on-surface-variant data-[state=active]:bg-primary-container data-[state=active]:text-on-primary-container data-[state=active]:shadow-sm"
        >
          {t.gridTool.collage}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
