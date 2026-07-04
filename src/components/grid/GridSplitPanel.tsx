import { useCallback, useEffect, useRef, useState } from 'react'
import { UploadZone } from '../UploadZone'
import { GridSizePicker } from './GridSizePicker'
import { MarginSlider } from '../MarginSlider'
import { Button } from '../ui/button'
import { computeSplitCanvasSize } from '../../lib/gridLayout'
import { renderSplitGrid } from '../../lib/gridRenderer'
import { exportCanvasToBlob } from '../../lib/cardRenderer'
import { loadImage } from '../../lib/loadImage'
import { useTranslation } from '../../i18n/LocaleContext'

interface GridSplitPanelProps {
  onGenerateCard: (canvas: HTMLCanvasElement) => void
  initialFile?: File
}

export function GridSplitPanel({ onGenerateCard, initialFile }: GridSplitPanelProps) {
  const t = useTranslation()
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [gapPx, setGapPx] = useState(8)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const [exportReady, setExportReady] = useState(false)

  const handleFileSelected = useCallback(async (file: File) => {
    const img = await loadImage(file)
    setPhoto(img)
  }, [])

  useEffect(() => {
    if (!initialFile) return
    handleFileSelected(initialFile)
  }, [initialFile, handleFileSelected])

  useEffect(() => {
    if (!photo) return
    const previewCanvas = previewCanvasRef.current
    const exportCanvas = exportCanvasRef.current
    if (!previewCanvas || !exportCanvas) return

    const imageWidth = photo.naturalWidth || photo.width
    const imageHeight = photo.naturalHeight || photo.height
    const { width, height } = computeSplitCanvasSize({ imageWidth, imageHeight, rows, cols, gapPx })

    previewCanvas.width = width
    previewCanvas.height = height
    const previewCtx = previewCanvas.getContext('2d')
    if (previewCtx) renderSplitGrid(previewCtx, { photo, rows, cols, gapPx, showGridLines: true })

    exportCanvas.width = width
    exportCanvas.height = height
    const exportCtx = exportCanvas.getContext('2d')
    if (exportCtx) renderSplitGrid(exportCtx, { photo, rows, cols, gapPx })

    setExportReady(true)
  }, [photo, rows, cols, gapPx])

  const handleExport = async () => {
    const canvas = exportCanvasRef.current
    if (!canvas) return
    const blob = await exportCanvasToBlob(canvas)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hueframe-grid-split.png'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateCard = () => {
    if (exportCanvasRef.current) onGenerateCard(exportCanvasRef.current)
  }

  return (
    <div className="px-5 pb-5">
      {!photo && <UploadZone onFileSelected={handleFileSelected} />}

      {photo && (
        <>
          <GridSizePicker
            rows={rows}
            cols={cols}
            onChange={({ rows: r, cols: c }) => {
              setRows(r)
              setCols(c)
            }}
          />
          <MarginSlider valuePx={gapPx} onChange={setGapPx} />

          <div className="mb-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
            <canvas ref={previewCanvasRef} className="block h-auto w-full" />
          </div>
          <canvas ref={exportCanvasRef} className="hidden" />

          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={handleExport} disabled={!exportReady}>
              {t.gridPanel.export}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleGenerateCard} disabled={!exportReady}>
              {t.gridPanel.generateCard}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
