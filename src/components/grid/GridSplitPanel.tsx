import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Lightbulb, RotateCcw, Shuffle } from 'lucide-react'
import { UploadZone } from '../UploadZone'
import { GridSizePicker } from './GridSizePicker'
import { GridConfigSections } from './GridConfigSections'
import { Highlight } from '../Highlight'
import { MarginSlider } from '../MarginSlider'
import { ExportButton } from '../ExportButton'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Slider } from '../ui/slider'
import { computeRotatedSplitLayout, scaleGridSpacing } from '../../lib/gridLayout'
import {
  renderRotatedSplitGrid,
  type GridBackground,
  type GridCellBorder,
  type GridCellBorderStyle,
} from '../../lib/gridRenderer'
import { loadImage } from '../../lib/loadImage'
import { useTranslation } from '../../i18n/LocaleContext'

const DEFAULT_CELL_BORDER_COLOR = '#d8d8d7'
const DEFAULT_GRID_BACKGROUND_COLOR = '#f9f9f8'
const BORDER_STYLES: GridCellBorderStyle[] = ['none', 'solid', 'dashed', 'dotted']

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
  const [paddingPx, setPaddingPx] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState(DEFAULT_GRID_BACKGROUND_COLOR)
  const [backgroundOpacity, setBackgroundOpacity] = useState(100)
  const [cellBorderColor, setCellBorderColor] = useState(DEFAULT_CELL_BORDER_COLOR)
  const [cellBorderWidthPx, setCellBorderWidthPx] = useState(1)
  const [cellBorderStyle, setCellBorderStyle] = useState<GridCellBorderStyle>('solid')
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
    const imageWidth = photo.naturalWidth || photo.width
    return computeRotatedSplitLayout({
      imageWidth,
      imageHeight: photo.naturalHeight || photo.height,
      rows,
      cols,
      gapXPx: scaleGridSpacing(gapXPx, imageWidth),
      gapYPx: scaleGridSpacing(gapYPx, imageWidth),
      paddingPx: scaleGridSpacing(paddingPx, imageWidth),
      rotationsDeg: rotations,
    })
  }, [photo, rows, cols, gapXPx, gapYPx, paddingPx, rotations])

  const gridBorder = useMemo<GridCellBorder | null>(() => {
    if (!photo) return null
    const imageWidth = photo.naturalWidth || photo.width
    return {
      color: cellBorderColor,
      widthPx: scaleGridSpacing(cellBorderWidthPx, imageWidth),
      style: cellBorderStyle,
    }
  }, [photo, cellBorderColor, cellBorderWidthPx, cellBorderStyle])

  const gridBackground = useMemo<GridBackground>(
    () => ({ color: backgroundColor, opacity: backgroundOpacity / 100 }),
    [backgroundColor, backgroundOpacity]
  )

  // 预览 + 导出画布同步渲染
  useEffect(() => {
    if (!photo || !layout || !gridBorder) return
    const previewCanvas = previewCanvasRef.current
    const exportCanvas = exportCanvasRef.current
    if (!previewCanvas || !exportCanvas) return

    previewCanvas.width = layout.canvasWidth
    previewCanvas.height = layout.canvasHeight
    const previewCtx = previewCanvas.getContext('2d')
    if (previewCtx) {
      renderRotatedSplitGrid(previewCtx, { photo, layout, showGridLines: true, gridBorder, gridBackground })
    }

    exportCanvas.width = layout.canvasWidth
    exportCanvas.height = layout.canvasHeight
    const exportCtx = exportCanvas.getContext('2d')
    if (exportCtx) {
      renderRotatedSplitGrid(exportCtx, { photo, layout, gridBorder, gridBackground })
    }

    setExportReady(true)
  }, [photo, layout, gridBorder, gridBackground])

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
    setRotations(Array.from({ length: rows * cols }, () => Math.round(Math.random() * 10 - 5)))
  }, [rows, cols])

  const handleResetRotation = useCallback(() => {
    setRotations(new Array(rows * cols).fill(0))
    setSelectedCell(null)
  }, [rows, cols])

  const handleGenerateCard = () => {
    if (exportCanvasRef.current) onGenerateCard(exportCanvasRef.current)
  }

  const selectedRotation = selectedCell !== null ? (rotations[selectedCell] ?? 0) : 0

  return (
    <div className="pb-5">
      {!photo && (
        <div className="relative flex flex-col items-center overflow-hidden px-5 pt-10 pb-8">
          <div className="absolute -left-[10%] top-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(224,233,228,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <div className="absolute -right-[10%] bottom-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(223,233,227,0.5)] mix-blend-multiply blur-[80px]" aria-hidden="true" />
          <h2 className="type-display mx-0 mb-6 mt-0 text-center">
            <Highlight text={t.emptyState.gridSplitHeading} mark={t.emptyState.gridSplitHeadingHighlight} />
          </h2>
          <UploadZone onFileSelected={handleFileSelected} />
          <p className="type-body mt-5 text-center text-outline opacity-75">{t.emptyState.supportedFormats}</p>
        </div>
      )}

      {photo && (
        <div className="px-5 pb-20">
          <div className="relative my-4">
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
              <canvas
                ref={previewCanvasRef}
                className="block h-auto w-full cursor-pointer"
                onClick={handleCanvasClick}
              />
            </div>
            {selectedCell !== null && layout && layout.cells[selectedCell] && (
              <div
                className="pointer-events-none absolute border-[3px] border-primary"
                style={{
                  left: `${((layout.cells[selectedCell].centerX - layout.cells[selectedCell].sWidth / 2) / layout.canvasWidth) * 100}%`,
                  top: `${((layout.cells[selectedCell].centerY - layout.cells[selectedCell].sHeight / 2) / layout.canvasHeight) * 100}%`,
                  width: `${(layout.cells[selectedCell].sWidth / layout.canvasWidth) * 100}%`,
                  height: `${(layout.cells[selectedCell].sHeight / layout.canvasHeight) * 100}%`,
                  transform: `rotate(${rotations[selectedCell] ?? 0}deg)`,
                }}
              />
            )}
          </div>
          <canvas ref={exportCanvasRef} className="hidden" />

          <GridConfigSections
            sections={[
              {
                id: 'layout',
                label: t.cardTabs.layout,
                content: (
                  <GridSizePicker
                    rows={rows}
                    cols={cols}
                    onChange={({ rows: r, cols: c }) => {
                      setRows(r)
                      setCols(c)
                    }}
                  />
                ),
              },
              {
                id: 'spacing',
                label: t.cardTabs.spacingAndWhitespace,
                content: (
                  <div className="flex flex-col gap-5">
                    <MarginSlider id="gap-x" label={t.gridPanel.gapHorizontal} valuePx={gapXPx} min={0} max={80} onChange={setGapXPx} />
                    <MarginSlider id="gap-y" label={t.gridPanel.gapVertical} valuePx={gapYPx} min={0} max={80} onChange={setGapYPx} />
                    <MarginSlider id="grid-padding" label={t.gridPanel.imagePadding} valuePx={paddingPx} min={0} max={80} onChange={setPaddingPx} />
                  </div>
                ),
              },
              {
                id: 'background',
                label: t.gridPanel.background,
                content: (
                  <GridBackgroundControls
                    color={backgroundColor}
                    opacity={backgroundOpacity}
                    colorLabel={t.gridPanel.backgroundColor}
                    opacityLabel={t.gridPanel.backgroundOpacity}
                    onColorChange={setBackgroundColor}
                    onOpacityChange={setBackgroundOpacity}
                  />
                ),
              },
              {
                id: 'border',
                label: t.gridPanel.cellBorder,
                content: (
                  <CellBorderControls
                    color={cellBorderColor}
                    widthPx={cellBorderWidthPx}
                    style={cellBorderStyle}
                    labels={{
                      color: t.gridPanel.cellBorderColor,
                      width: t.gridPanel.cellBorderWidth,
                      style: t.gridPanel.cellBorderStyle,
                      styles: {
                        none: t.gridPanel.cellBorderNone,
                        solid: t.gridPanel.cellBorderSolid,
                        dashed: t.gridPanel.cellBorderDashed,
                        dotted: t.gridPanel.cellBorderDotted,
                      },
                    }}
                    onColorChange={setCellBorderColor}
                    onWidthChange={setCellBorderWidthPx}
                    onStyleChange={setCellBorderStyle}
                  />
                ),
              },
              {
                id: 'rotation',
                label: t.gridPanel.cellRotation,
                content: (
                  <div className="flex flex-col gap-4">
                    {selectedCell === null && (
                      <aside
                        role="note"
                        className="flex items-start gap-3 rounded-lg border border-primary/15 bg-primary-container/45 px-3.5 py-3 text-on-primary-container"
                      >
                        <span
                          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest/80 text-primary shadow-sm"
                          aria-hidden="true"
                        >
                          <Lightbulb className="size-4" strokeWidth={1.8} />
                        </span>
                        <span className="min-w-0 pt-0.5">
                          <span className="type-caption block font-semibold tracking-[0.08em] text-primary">
                            {t.gridPanel.rotationTip}
                          </span>
                          <span className="type-label mt-0.5 block text-on-surface-variant">
                            {t.gridPanel.rotationHint}
                          </span>
                        </span>
                      </aside>
                    )}
                    {selectedCell !== null && (
                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <span className="type-caption text-on-surface-variant">
                            {t.gridPanel.cellRotation}：
                            {t.gridPanel.cellCoord
                              .replace('{row}', String(Math.floor(selectedCell / cols) + 1))
                              .replace('{col}', String((selectedCell % cols) + 1))}
                          </span>
                          <span className="type-label font-medium tabular-nums text-on-surface">
                            {Math.round(selectedRotation)}°
                          </span>
                        </div>
                        <Slider
                          min={-180}
                          max={180}
                          step={1}
                          value={[selectedRotation]}
                          onValueChange={([val]) =>
                            setRotations((prev) => prev.map((r, i) => (i === selectedCell ? val : r)))
                          }
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" className="shadow-none" onClick={handleRandomRotate}>
                        <Shuffle aria-hidden="true" />
                        {t.gridPanel.randomRotate}
                      </Button>
                      <Button variant="secondary" size="sm" className="shadow-none" onClick={handleResetRotation}>
                        <RotateCcw aria-hidden="true" />
                        {t.gridPanel.resetRotation}
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
          />

          <ExportButton
            canvas={exportReady ? exportCanvasRef.current : null}
            fileName="hueframe-grid-split.png"
            saveLabel={t.gridPanel.export}
            onFilesReplaced={([file]) => file && handleFileSelected(file)}
            secondaryLabel={t.gridPanel.generateCard}
            secondaryDisabled={!exportReady}
            onSecondaryAction={handleGenerateCard}
          />
        </div>
      )}
    </div>
  )
}

interface CellBorderControlsProps {
  color: string
  widthPx: number
  style: GridCellBorderStyle
  labels: {
    color: string
    width: string
    style: string
    styles: Record<GridCellBorderStyle, string>
  }
  onColorChange: (color: string) => void
  onWidthChange: (widthPx: number) => void
  onStyleChange: (style: GridCellBorderStyle) => void
}

function CellBorderControls({
  color,
  widthPx,
  style,
  labels,
  onColorChange,
  onWidthChange,
  onStyleChange,
}: CellBorderControlsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <ColorControl id="grid-cell-border-color" label={labels.color} color={color} onChange={onColorChange} />
      </div>

      <MarginSlider id="grid-cell-border-width" label={labels.width} valuePx={widthPx} min={0} max={12} onChange={onWidthChange} />

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="type-caption text-on-surface-variant">{labels.style}</span>
          <span className="type-label text-on-surface">{labels.styles[style]}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {BORDER_STYLES.map((borderStyle) => (
            <Button
              key={borderStyle}
              type="button"
              variant={style === borderStyle ? 'secondary' : 'outline'}
              size="sm"
              aria-pressed={style === borderStyle}
              onClick={() => onStyleChange(borderStyle)}
              className="h-12 flex-col gap-1 shadow-none"
            >
              <span
                className="h-0 w-8 border-t-2"
                style={{
                  borderColor: borderStyle === 'none' ? 'transparent' : color,
                  borderTopStyle: borderStyle === 'none' ? 'solid' : borderStyle,
                }}
                aria-hidden="true"
              />
              <span className="type-label">{labels.styles[borderStyle]}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface GridBackgroundControlsProps {
  color: string
  opacity: number
  colorLabel: string
  opacityLabel: string
  onColorChange: (color: string) => void
  onOpacityChange: (opacity: number) => void
}

function GridBackgroundControls({
  color,
  opacity,
  colorLabel,
  opacityLabel,
  onColorChange,
  onOpacityChange,
}: GridBackgroundControlsProps) {
  return (
    <div className="flex flex-col gap-5">
      <ColorControl id="grid-background-color" label={colorLabel} color={color} onChange={onColorChange} />
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="type-caption text-on-surface-variant" htmlFor="grid-background-opacity">
            {opacityLabel}
          </label>
          <span className="type-label font-medium tabular-nums text-on-surface">{opacity}%</span>
        </div>
        <Slider
          id="grid-background-opacity"
          aria-label={opacityLabel}
          min={0}
          max={100}
          value={[opacity]}
          onValueChange={([next]) => onOpacityChange(next)}
        />
      </div>
    </div>
  )
}

interface ColorControlProps {
  id: string
  label: string
  color: string
  onChange: (color: string) => void
}

function ColorControl({ id, label, color, onChange }: ColorControlProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="type-caption text-on-surface-variant" htmlFor={id}>
          {label}
        </label>
        <span className="type-label font-medium tabular-nums text-on-surface">{color.toUpperCase()}</span>
      </div>
      <div className="flex h-11 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5">
        <Input
          id={id}
          type="color"
          aria-label={label}
          value={color}
          onChange={(event) => onChange(event.target.value)}
          className="h-7 w-10 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0 focus-visible:ring-0"
        />
        <span className="type-caption font-mono text-on-surface">{color.toUpperCase()}</span>
      </div>
    </div>
  )
}
