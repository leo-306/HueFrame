import { useCallback, useEffect, useRef, useState } from 'react'
import { MultiUploadZone } from './MultiUploadZone'
import { Highlight } from '../Highlight'
import { GridSizePicker } from './GridSizePicker'
import { GridConfigSections } from './GridConfigSections'
import { MarginSlider } from '../MarginSlider'
import { ExportButton } from '../ExportButton'
import { computeCollageCanvasSize, scaleGridSpacing } from '../../lib/gridLayout'
import {
  FIXED_COLLAGE_TEMPLATE_CAPACITY,
  isFixedCollageTemplate,
  renderCollageGrid,
  type CollageTemplateId,
} from '../../lib/gridRenderer'
import { loadImage } from '../../lib/loadImage'
import { useTranslation } from '../../i18n/LocaleContext'

const CELL_SIZE = 300
const COLLAGE_TEMPLATES: CollageTemplateId[] = [
  'clean',
  'focus',
  'film',
  'scrapbook',
  'plog',
  'magazine',
  'colorStory',
  'cinematic',
]
const FIXED_CANVAS_SIZE = { width: 900, height: 1200 }
const TEMPLATE_SPACING: Record<CollageTemplateId, { gap: number; padding: number }> = {
  clean: { gap: 8, padding: 0 },
  focus: { gap: 18, padding: 24 },
  film: { gap: 14, padding: 20 },
  scrapbook: { gap: 28, padding: 38 },
  plog: { gap: 12, padding: 30 },
  magazine: { gap: 14, padding: 32 },
  colorStory: { gap: 16, padding: 32 },
  cinematic: { gap: 8, padding: 24 },
}

interface GridCollagePanelProps {
  onGenerateCard: (canvas: HTMLCanvasElement) => void
}

export function GridCollagePanel({ onGenerateCard }: GridCollagePanelProps) {
  const t = useTranslation()
  const [photos, setPhotos] = useState<HTMLImageElement[]>([])
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [gapPx, setGapPx] = useState(8)
  const [paddingPx, setPaddingPx] = useState(0)
  const [templateId, setTemplateId] = useState<CollageTemplateId>('clean')
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
    const fixedTemplate = isFixedCollageTemplate(templateId)
    const contentWidth = fixedTemplate ? FIXED_CANVAS_SIZE.width : CELL_SIZE * cols
    const canvasGapPx = scaleGridSpacing(gapPx, contentWidth)
    const canvasPaddingPx = scaleGridSpacing(paddingPx, contentWidth)
    const { width, height } = fixedTemplate
      ? FIXED_CANVAS_SIZE
      : computeCollageCanvasSize({
          rows,
          cols,
          cellWidth: CELL_SIZE,
          cellHeight: CELL_SIZE,
          gapPx: canvasGapPx,
          paddingPx: canvasPaddingPx,
        })
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderCollageGrid(ctx, {
      photos,
      rows,
      cols,
      cellWidth: CELL_SIZE,
      cellHeight: CELL_SIZE,
      gapPx: canvasGapPx,
      paddingPx: canvasPaddingPx,
      templateId,
    })
    setExportReady(true)
  }, [photos, rows, cols, gapPx, paddingPx, templateId])

  const handleTemplateChange = (nextTemplate: CollageTemplateId) => {
    setTemplateId(nextTemplate)
    setGapPx(TEMPLATE_SPACING[nextTemplate].gap)
    setPaddingPx(TEMPLATE_SPACING[nextTemplate].padding)
  }

  const handleGenerateCard = () => {
    if (canvasRef.current) onGenerateCard(canvasRef.current)
  }

  const fixedTemplate = isFixedCollageTemplate(templateId)
  const totalCells = FIXED_COLLAGE_TEMPLATE_CAPACITY[templateId] ?? rows * cols
  const showOverflowHint = photos.length > totalCells
  const templateLabels: Record<CollageTemplateId, string> = {
    clean: t.gridPanel.templateClean,
    focus: t.gridPanel.templateFocus,
    film: t.gridPanel.templateFilm,
    scrapbook: t.gridPanel.templateScrapbook,
    plog: t.gridPanel.templatePlog,
    magazine: t.gridPanel.templateMagazine,
    colorStory: t.gridPanel.templateColorStory,
    cinematic: t.gridPanel.templateCinematic,
  }

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

          <GridConfigSections
            sections={[
              {
                id: 'template',
                label: t.gridPanel.template,
                content: (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {COLLAGE_TEMPLATES.map((id) => {
                      return (
                        <button
                          key={id}
                          type="button"
                          aria-pressed={templateId === id}
                          onClick={() => handleTemplateChange(id)}
                          className={`rounded-xl border p-2.5 text-left transition-colors ${
                            templateId === id
                              ? 'border-primary/35 bg-primary-container/65 text-primary'
                              : 'border-outline-variant/45 bg-surface text-on-surface-variant'
                          }`}
                        >
                          <span className={`mb-2 grid aspect-[4/3] grid-cols-3 gap-0.5 overflow-hidden rounded-md p-1 ${templatePreviewBackground(id)}`} aria-hidden="true">
                            {Array.from({ length: 9 }, (_, index) => (
                              <span
                                key={index}
                                className={templatePreviewCell(id, index)}
                                style={id === 'scrapbook' ? { transform: `rotate(${[-3, 2, -1, 2, 0, -2, 1, -2, 3][index]}deg)` } : undefined}
                              />
                            ))}
                          </span>
                          <span className="type-label block text-center font-medium">{templateLabels[id]}</span>
                        </button>
                      )
                    })}
                  </div>
                ),
              },
              ...(!fixedTemplate
                ? [
                    {
                      id: 'layout',
                      label: t.cardTabs.layout,
                      content: <GridSizePicker rows={rows} cols={cols} onChange={({ rows: r, cols: c }) => { setRows(r); setCols(c) }} />,
                    },
                  ]
                : []),
              {
                id: 'spacing',
                label: t.cardTabs.spacingAndWhitespace,
                content: (
                  <div className="flex flex-col gap-5">
                    <MarginSlider id="collage-gap" label={t.marginSlider.label} valuePx={gapPx} min={0} max={80} onChange={setGapPx} />
                    <MarginSlider id="collage-padding" label={t.gridPanel.imagePadding} valuePx={paddingPx} min={0} max={80} onChange={setPaddingPx} />
                  </div>
                ),
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

function templatePreviewBackground(templateId: CollageTemplateId): string {
  if (templateId === 'film' || templateId === 'cinematic') return 'bg-[#151816]'
  if (templateId === 'scrapbook') return 'bg-[#e9dfcf]'
  if (templateId === 'plog' || templateId === 'colorStory') return 'bg-[#f4f0e7]'
  return 'bg-[#eee9de]'
}

function templatePreviewCell(templateId: CollageTemplateId, index: number): string {
  if (templateId === 'cinematic') return 'col-span-3 min-h-2 bg-[#68736d]'
  if (templateId === 'magazine') {
    if (index === 0) return 'col-span-2 row-span-2 bg-[#75837c]'
    if (index === 5) return 'col-span-2 bg-[#aab3ad]'
    return 'bg-[#8f9b94]'
  }
  if (templateId === 'colorStory' && [2, 4, 8].includes(index)) {
    return ['bg-[#c65a43]', 'bg-[#6f8378]', 'bg-[#d8c6a4]'][[2, 4, 8].indexOf(index)]
  }
  if (templateId === 'film') return 'border border-[#e7e2d7] bg-[#68736d]'
  if (templateId === 'scrapbook') return 'border-2 border-white bg-[#a8b4ad] shadow-sm'
  if (templateId === 'plog') return 'border border-white bg-[#8f9c95] shadow-sm'
  if (templateId === 'focus' && index === 4) return 'border-2 border-[#c65a43] bg-[#7f9187]'
  return 'bg-[#a8b4ad]'
}
