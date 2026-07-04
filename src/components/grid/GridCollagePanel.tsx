import { useCallback, useEffect, useRef, useState } from 'react'
import { MultiUploadZone } from './MultiUploadZone'
import { GridSizePicker } from './GridSizePicker'
import { MarginSlider } from '../MarginSlider'
import { Button } from '../ui/button'
import { computeCollageCanvasSize } from '../../lib/gridLayout'
import { renderCollageGrid } from '../../lib/gridRenderer'
import { exportCanvasToBlob } from '../../lib/cardRenderer'
import { loadImage } from '../../lib/loadImage'

const CELL_SIZE = 300

interface GridCollagePanelProps {
  onGenerateCard: (canvas: HTMLCanvasElement) => void
}

export function GridCollagePanel({ onGenerateCard }: GridCollagePanelProps) {
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

  const handleExport = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const blob = await exportCanvasToBlob(canvas)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hueframe-grid-collage.png'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateCard = () => {
    if (canvasRef.current) onGenerateCard(canvasRef.current)
  }

  const totalCells = rows * cols
  const showOverflowHint = photos.length > totalCells

  return (
    <div className="px-5 pb-5">
      {photos.length === 0 && <MultiUploadZone onFilesSelected={handleFilesSelected} />}

      {photos.length > 0 && (
        <>
          <GridSizePicker rows={rows} cols={cols} onChange={({ rows: r, cols: c }) => { setRows(r); setCols(c) }} />
          <MarginSlider valuePx={gapPx} onChange={setGapPx} />

          {showOverflowHint && (
            <p className="mb-3 text-sm text-on-surface-variant">仅使用前 {totalCells} 张</p>
          )}

          <div className="mb-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>

          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={handleExport} disabled={!exportReady}>
              导出图片
            </Button>
            <Button variant="secondary" size="lg" onClick={handleGenerateCard} disabled={!exportReady}>
              生成色卡
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
