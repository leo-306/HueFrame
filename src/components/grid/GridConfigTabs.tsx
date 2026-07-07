import type { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

interface GridConfigTab {
  id: string
  label: string
  content: ReactNode
}

interface GridConfigTabsProps {
  tabs: GridConfigTab[]
}

export function GridConfigTabs({ tabs }: GridConfigTabsProps) {
  return (
    <Tabs defaultValue={tabs[0]?.id} className="my-5 flex-col gap-4">
      <TabsList className="h-auto w-full bg-surface-container-low p-1.5">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="min-h-10 px-3 py-2">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-5 sm:p-7"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
