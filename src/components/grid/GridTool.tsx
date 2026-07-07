import { Tabs, TabsContent } from '../ui/tabs'
import { GridSplitPanel } from './GridSplitPanel'
import { GridCollagePanel } from './GridCollagePanel'

export type GridSubTab = 'split' | 'collage'

interface GridToolProps {
  activeSubTab: GridSubTab
  onGenerateCard: (canvas: HTMLCanvasElement) => void
  initialFile?: File
}

export function GridTool({ activeSubTab, onGenerateCard, initialFile }: GridToolProps) {
  return (
    <Tabs value={activeSubTab} className="w-full flex-col">
      <TabsContent value="split" className="w-full pb-4" forceMount hidden={activeSubTab !== 'split'}>
        <GridSplitPanel onGenerateCard={onGenerateCard} initialFile={initialFile} />
      </TabsContent>
      <TabsContent value="collage" className="w-full pb-4" forceMount hidden={activeSubTab !== 'collage'}>
        <GridCollagePanel onGenerateCard={onGenerateCard} />
      </TabsContent>
    </Tabs>
  )
}
