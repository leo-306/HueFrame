import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { UploadZone } from '../UploadZone'
import { GridSizePicker } from './GridSizePicker'
import { MarginSlider } from '../MarginSlider'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { computeRotatedSplitLayout } from '../../lib/gridLayout'
import { renderRotatedSplitGrid } from '../../lib/gridRenderer'
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
  const [gapXPx, setGapXPx] = useState(8)
  const [gapYPx, setGapYPx] = useState(8)
  const [rotations, setRotations] = useState<number[]>(new Array(9).fill(0))
  const [selectedCell, setSelectedCell] = useState<number | null>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const [exportReady, setExportReady] = useState(false)

  // 网格尺寸变化时重置旋转和选中状态
  useEffect(() => {
    setRotations(new Array(rows * cols).fill(0))
    setSelectedCell(null)
  }, [rows, cols])

  const handleFileSelected = useCallback(async (file: File) => {
    const img = await loadImage(file)
    setPhoto(img)
    setRotations((prev) => new Array(prev.length).fill(0))
    setSelectedCell(null)
  }, [])

  useEffect(() => {
    if (!initialFile) return
    handleFileSelected(initialFile)
  }, [initialFile, handleFileSelected])

  const layout = useMemo(() => {
    if (!photo) return null
    return computeRotatedSplitLayout({
      imageWidth: photo.naturalWidth || photo.width,
      imageHeight: photo.naturalHeight || photo.height,
      rows,
      cols,
      gapXPx,
      gapYPx,
      rotationsDeg: rotations,
    })
  }, [photo, rows, cols, gapXPx, gapYPx, rotations])

  // 预览 + 导出画布同步渲染
  useEffect(() => {
    if (!photo || !layout) return
    const previewCanvas = previewCanvasRef.current
    const exportCanvas = exportCanvasRef.current
    if (!previewCanvas || !exportCanvas) return

    previewCanvas.width = layout.canvasWidth
    previewCanvas.height = layout.canvasHeight
    const previewCtx = previewCanvas.getContext('2d')
    if (previewCtx) {
      renderRotatedSplitGrid(previewCtx, { photo, layout, showGridLines: true, selectedCell })
    }

    exportCanvas.width = layout.canvasWidth
    exportCanvas.height = layout.canvasHeight
    const exportCtx = exportCanvas.getContext('2d')
    if (exportCtx) {
      renderRotatedSplitGrid(exportCtx, { photo, layout })
    }

    setExportReady(true)
  }, [photo, layout, selectedCell])

  // 点击画布选格：找最近中心点
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!layout || !photo) return
      const canvas = previewCanvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const cx = (e.clientX - rect.left) * (canvas.width / rect.width)
      const cy = (e.clientY - rect.top) * (canvas.height / rect.height)

      let nearest = -1
      let minDist = Infinity
      for (const cell of layout.cells) {
        const d = Math.hypot(cx - cell.centerX, cy - cell.centerY)
        if (d < minDist) {
          minDist = d
          nearest = cell.row * cols + cell.col
        }
      }

      setSelectedCell((prev) => (prev === nearest ? null : nearest))
    },
    [layout, photo, cols]
  )

  const handleRandomRotate = useCallback(() => {
    setRotations(Array.from({ length: rows * cols }, () => Math.round(Math.random() * 40 - 20)))
  }, [rows, cols])

  const handleResetRotation = useCallback(() => {
    setRotations(new Array(rows * cols).fill(0))
    setSelectedCell(null)
  }, [rows, cols])

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

  const selectedRotation = selectedCell !== null ? (rotations[selectedCell] ?? 0) : 0

  return (
    <div className="pb-5">
      {!photo && (
        <div className="relative flex flex-col items-center overflow-hidden px-5 pt-8 pb-8">
          <div className="absolute -left-[10%] top-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(224,233,228,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <div className="absolute -right-[10%] bottom-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(223,233,227,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <h2 className="type-display mx-0 mb-6 mt-0 text-center">{t.emptyState.gridSplitHeading}</h2>
          <UploadZone onFileSelected={handleFileSelected} />
          <p className="type-body mt-5 text-center text-outline opacity-75">{t.emptyState.supportedFormats}</p>
        </div>
      )}

      {photo && (
        <div className="px-5">
          <GridSizePicker
            rows={rows}
            cols={cols}
            onChange={({ rows: r, cols: c }) => {
              setRows(r)
              setCols(c)
            }}
          />

          <MarginSlider
            id="gap-x"
            label={t.gridPanel.gapHorizontal}
            valuePx={gapXPx}
            onChange={setGapXPx}
            max={40}
          />
          <div className="mt-4">
            <MarginSlider
              id="gap-y"
              label={t.gridPanel.gapVertical}
              valuePx={gapYPx}
              onChange={setGapYPx}
              max={40}
            />
          </div>

          <div className="my-4 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
            <canvas
              ref={previewCanvasRef}
              className="block h-auto w-full cursor-pointer"
              onClick={handleCanvasClick}
            />
          </div>
          <canvas ref={exportCanvasRef} className="hidden" />

          {selectedCell !== null && (
            <div className="mb-4">
              <div className="type-body mb-3 flex items-center justify-between text-on-surface-variant">
                <span>
                  {t.gridPanel.cellRotation}：
                  {t.gridPanel.cellCoord
                    .replace('{row}', String(Math.floor(selectedCell / cols) + 1))
                    .replace('{col}', String((selectedCell % cols) + 1))}
                </span>
                <span>{Math.round(selectedRotation)}°</span>
              </div>
              <Slider
                min={-30}
                max={30}
                step={1}
                value={[selectedRotation]}
                onValueChange={([val]) =>
                  setRotations((prev) => prev.map((r, i) => (i === selectedCell ? val : r)))
                }
              />
            </div>
          )}

          <div className="mb-4 flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRandomRotate}>
              {t.gridPanel.randomRotate}
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetRotation}>
              {t.gridPanel.resetRotation}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button size="lg" onClick={handleExport} disabled={!exportReady}>
              {t.gridPanel.export}
            </Button>
            <Button variant="secondary" size="lg" onClick={handleGenerateCard} disabled={!exportReady}>
              {t.gridPanel.generateCard}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
