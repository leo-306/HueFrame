import { useCallback, useEffect, useRef, useState } from 'react'
import { MultiUploadZone } from './MultiUploadZone'
import { Highlight } from '../Highlight'
import { GridSizePicker } from './GridSizePicker'
import { GridConfigTabs } from './GridConfigTabs'
import { MarginSlider } from '../MarginSlider'
import { ExportButton } from '../ExportButton'
import { computeCollageCanvasSize } from '../../lib/gridLayout'
import { renderCollageGrid } from '../../lib/gridRenderer'
import { loadImage } from '../../lib/loadImage'
import { useTranslation } from '../../i18n/LocaleContext'

const CELL_SIZE = 300

interface GridCollagePanelProps {
  onGenerateCard: (canvas: HTMLCanvasElement) => void
}

export function GridCollagePanel({ onGenerateCard }: GridCollagePanelProps) {
  const t = useTranslation()
  const [photos, setPhotos] = useState<HTMLImageElement[]>([])
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [gapPx, setGapPx] = useState(8)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [exportReady, setExportReady] = useState(false)

  const handleFilesSelected = useCallback(async (files: File[]) => {
    const images = await Promise.all(files.map(loadImage))
    setPhotos(images)
  }, [])

  useEffect(() => {
    if (photos.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const { width, height } = computeCollageCanvasSize({ rows, cols, cellWidth: CELL_SIZE, cellHeight: CELL_SIZE, gapPx })
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderCollageGrid(ctx, { photos, rows, cols, cellWidth: CELL_SIZE, cellHeight: CELL_SIZE, gapPx })
    setExportReady(true)
  }, [photos, rows, cols, gapPx])

  const handleGenerateCard = () => {
    if (canvasRef.current) onGenerateCard(canvasRef.current)
  }

  const totalCells = rows * cols
  const showOverflowHint = photos.length > totalCells

  return (
    <div className="pb-5">
      {photos.length === 0 && (
        <div className="relative flex flex-col items-center overflow-hidden px-5 pt-10 pb-8">
          <div className="absolute -left-[10%] top-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(224,233,228,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <div className="absolute -right-[10%] bottom-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(223,233,227,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <h2 className="type-display mx-0 mb-6 mt-0 text-center">
            <Highlight text={t.emptyState.gridCollageHeading} mark={t.emptyState.gridCollageHeadingHighlight} />
          </h2>
          <MultiUploadZone onFilesSelected={handleFilesSelected} />
          <p className="type-body mt-5 text-center text-outline opacity-75">{t.emptyState.supportedFormats}</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="px-5 pb-20">
          {showOverflowHint && (
            <p className="mb-3 text-sm text-on-surface-variant">
              {t.gridPanel.overflowHint.replace('{count}', String(totalCells))}
            </p>
          )}

          <div className="relative mb-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>

          <GridConfigTabs
            tabs={[
              {
                id: 'layout',
                label: t.cardTabs.layout,
                content: <GridSizePicker rows={rows} cols={cols} onChange={({ rows: r, cols: c }) => { setRows(r); setCols(c) }} />,
              },
              {
                id: 'spacing',
                label: t.cardTabs.spacingAndWhitespace,
                content: <MarginSlider id="collage-gap" label={t.marginSlider.label} valuePx={gapPx} min={0} max={80} onChange={setGapPx} />,
              },
            ]}
          />

          <ExportButton
            canvas={exportReady ? canvasRef.current : null}
            fileName="hueframe-grid-collage.png"
            saveLabel={t.gridPanel.export}
            multiple
            onFilesReplaced={handleFilesSelected}
            secondaryLabel={t.gridPanel.generateCard}
            secondaryDisabled={!exportReady}
            onSecondaryAction={handleGenerateCard}
          />
        </div>
      )}
    </div>
  )
}
