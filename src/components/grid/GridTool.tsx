import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { GridSplitPanel } from './GridSplitPanel'
import { GridCollagePanel } from './GridCollagePanel'

type GridSubTab = 'split' | 'collage'

interface GridToolProps {
  onGenerateCard: (canvas: HTMLCanvasElement) => void
}

export function GridTool({ onGenerateCard }: GridToolProps) {
  const [activeSubTab, setActiveSubTab] = useState<GridSubTab>('split')

  return (
    <Tabs value={activeSubTab} onValueChange={(value) => setActiveSubTab(value as GridSubTab)} className="flex-col px-5">
      <TabsList className="my-5 h-auto w-full bg-surface-container-low p-1">
        <TabsTrigger value="split" className="py-2">切分</TabsTrigger>
        <TabsTrigger value="collage" className="py-2">拼图</TabsTrigger>
      </TabsList>

      <TabsContent value="split" className="pb-4" forceMount hidden={activeSubTab !== 'split'}>
        <GridSplitPanel onGenerateCard={onGenerateCard} />
      </TabsContent>
      <TabsContent value="collage" className="pb-4" forceMount hidden={activeSubTab !== 'collage'}>
        <GridCollagePanel onGenerateCard={onGenerateCard} />
      </TabsContent>
    </Tabs>
  )
}
