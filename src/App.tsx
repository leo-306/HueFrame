import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { TopBar } from './components/TopBar'
import { BottomNav, type AppTab } from './components/BottomNav'
import { EmptyState } from './components/EmptyState'
import { CardTabs, type CardSubTab } from './components/CardTabs'
import { FilterPicker } from './components/FilterPicker'
import { TemplatePicker } from './components/TemplatePicker'
import { MarginSlider } from './components/MarginSlider'
import { PaletteList } from './components/PaletteList'
import { PaletteControls } from './components/PaletteControls'
import { InfoPanel } from './components/InfoPanel'
import { CardPreview } from './components/CardPreview'
import { ExportButton } from './components/ExportButton'
import { GridTool, type GridSubTab } from './components/grid/GridTool'
import { GridSubTabSwitcher } from './components/grid/GridSubTabSwitcher'
import { HomeTab } from './components/HomeTab'
import { CropPanel } from './components/CropPanel'
import { Button } from './components/ui/button'
import { COLOR_FORMATS } from './lib/colorFormat'
import { buildCardConfig, extractPaletteEntries, PALETTE_SIZE } from './lib/photoPipeline'
import { applyFilter, type FilterName } from './lib/filters'
import { fitWithin } from './lib/imageScale'
import { dimensionsForTemplate } from './lib/cardDimensions'
import { updatePaletteEntryColor } from './lib/paletteEditing'
import { renderClassicStrip } from './templates/classicStrip'
import { renderMagazineCover } from './templates/magazineCover'
import { renderEditorialFrame } from './templates/editorialFrame'
import { renderPolaroidJournal } from './templates/polaroidJournal'
import { renderColorArchive } from './templates/colorArchive'
import { renderPantoneCard } from './templates/pantoneCard'
import { renderColorAnnotation } from './templates/colorAnnotation'
import { renderDesignerSpec } from './templates/designerSpec'
import { renderHeroHex } from './templates/heroHex'
import { renderBandList } from './templates/bandList'
import { renderColorSpectrum } from './templates/colorSpectrum'
import type { CardConfig, ColorNameLanguage, PaletteEntry, TemplateId, TemplateRenderer } from './templates/types'
import { loadImage } from './lib/loadImage'
import type { ColorFormat } from './lib/colorFormat'
import { useTranslation } from './i18n/LocaleContext'
import { LanguagePicker } from './components/LanguagePicker'
import { LoadingOverlay } from './components/LoadingOverlay'
import { fetchMockPhoto } from './lib/mockPhoto'

const RENDERERS: Record<TemplateId, TemplateRenderer> = {
  classicStrip: renderClassicStrip,
  magazineCover: renderMagazineCover,
  editorialFrame: renderEditorialFrame,
  polaroidJournal: renderPolaroidJournal,
  colorArchive: renderColorArchive,
  pantoneCard: renderPantoneCard,
  colorAnnotation: renderColorAnnotation,
  designerSpec: renderDesignerSpec,
  heroHex: renderHeroHex,
  bandList: renderBandList,
  colorSpectrum: renderColorSpectrum,
}

const TEMPLATE_IDS = Object.keys(RENDERERS) as TemplateId[]
const MOCK_ENABLED = import.meta.env.DEV

/** 滤镜工作分辨率上限：卡片只按 800px 宽渲染，1600px 已留足 2x 余量。 */
const FILTER_WORK_MAX_EDGE = 1600
/** 每张原图的各滤镜结果缓存，切回滤镜时零成本。键为原图，随原图一起回收。 */
const filterCache = new WeakMap<HTMLImageElement, Map<FilterName, HTMLImageElement>>()

function applyFilterToImage(photo: HTMLImageElement, filter: FilterName): Promise<HTMLImageElement> {
  const cached = filterCache.get(photo)?.get(filter)
  if (cached) return Promise.resolve(cached)

  // 降采样到工作分辨率再处理：12MP 原图逐像素变换 + toDataURL  base64 既慢又占内存，
  // 而卡片用不到那么高分辨率。
  const { width, height } = fitWithin(photo.naturalWidth, photo.naturalHeight, FILTER_WORK_MAX_EDGE)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(photo, 0, 0, width, height)
  applyFilter(canvas, filter)

  return new Promise<HTMLImageElement>((resolve) => {
    // toBlob + objectURL 取代 toDataURL：后者会产出数十 MB 的 base64 字符串。
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(photo)
        return
      }
      const filtered = new Image()
      filtered.onload = () => resolve(filtered)
      filtered.src = URL.createObjectURL(blob)
    }, 'image/png')
  }).then((result) => {
    let byFilter = filterCache.get(photo)
    if (!byFilter) {
      byFilter = new Map()
      filterCache.set(photo, byFilter)
    }
    byFilter.set(filter, result)
    return result
  })
}

export default function App() {
  const t = useTranslation()
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const hash = window.location.hash.slice(1)
    return ['card', 'grid', 'crop'].includes(hash) ? (hash as AppTab) : MOCK_ENABLED ? 'card' : 'home'
  })

  const [gridSubTab, setGridSubTab] = useState<GridSubTab>('split')

  useEffect(() => {
    window.history.replaceState(null, '', activeTab === 'home' ? location.pathname : `#${activeTab}`)
  }, [activeTab])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (['card', 'grid', 'crop'].includes(hash)) {
        setActiveTab(hash as AppTab)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  const [activeSubTab, setActiveSubTab] = useState<CardSubTab>('filter')
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false)
  const hasLoadedMockPhoto = useRef(false)
  const uploadIdRef = useRef(0)

  // originalPhoto + baseConfig 保存取色/EXIF 等一次性处理结果（基于未加滤镜的原图，
  // 保证色卡反映照片真实色彩）；滤镜只影响展示用的 displayPhoto，不重新提取颜色。
  const [originalPhoto, setOriginalPhoto] = useState<HTMLImageElement | null>(null)
  const [baseConfig, setBaseConfig] = useState<CardConfig | null>(null)
  const [displayPhoto, setDisplayPhoto] = useState<HTMLImageElement | null>(null)
  const [isMockPhoto, setIsMockPhoto] = useState(false)

  // 调色/信息 Tab 的手动编辑覆盖值：未编辑时为 null，读取 baseConfig 里的自动识别结果。
  const [paletteOverride, setPaletteOverride] = useState<PaletteEntry[] | null>(null)
  const [locationOverride, setLocationOverride] = useState<string | null>(null)
  const [capturedAtOverride, setCapturedAtOverride] = useState<string | null>(null)

  const [template, setTemplate] = useState<TemplateId>('classicStrip')
  const [filter, setFilter] = useState<FilterName>('none')
  const [language, setLanguage] = useState<ColorNameLanguage>('zh')
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex')
  const [paletteSize, setPaletteSize] = useState(PALETTE_SIZE)
  const [marginPx, setMarginPx] = useState(24)
  const [swatchGapPx, setSwatchGapPx] = useState(16)
  const [swatchRadiusPx, setSwatchRadiusPx] = useState(6)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)
  const [watermarkOpacity, setWatermarkOpacity] = useState(55)

  const [isProcessing, setIsProcessing] = useState(false)
  const [isExtractingColors, setIsExtractingColors] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null)

  const config = useMemo(() => {
    if (!baseConfig || !displayPhoto) return null
    const { width, height } = dimensionsForTemplate(
      template,
      displayPhoto.naturalWidth,
      displayPhoto.naturalHeight,
      marginPx
    )
    return {
      ...baseConfig,
      photo: displayPhoto,
      colorNameLanguage: language,
      colorFormat,
      width,
      height,
      marginPx,
      swatchGapPx,
      swatchRadiusPx,
      watermarkEnabled,
      watermarkOpacity: watermarkOpacity / 100,
      palette: paletteOverride ?? baseConfig.palette,
      locationName: locationOverride ?? baseConfig.locationName,
      capturedAtText: capturedAtOverride ?? baseConfig.capturedAtText,
    }
  }, [
    baseConfig,
    displayPhoto,
    template,
    language,
    colorFormat,
    marginPx,
    swatchGapPx,
    swatchRadiusPx,
    watermarkEnabled,
    watermarkOpacity,
    paletteOverride,
    locationOverride,
    capturedAtOverride,
  ])

  const handleFileSelected = useCallback(
    async (file: File, isMock = false) => {
      // 代际标记：连续上传时，只有最后一次的结果能写入 state，
      // 避免慢的旧图（如 HEIC）覆盖快的新图，导致照片与色卡错配。
      const requestId = ++uploadIdRef.current
      setIsProcessing(true)
      setProcessingError(null)
      try {
        const photo = await loadImage(file)
        const { width, height } = dimensionsForTemplate(template, photo.naturalWidth, photo.naturalHeight, marginPx)
        const cardConfig = await buildCardConfig(file, photo, {
          width,
          height,
          titleFont: 'Georgia, serif',
          colorNameLanguage: language,
          unknownLocationLabel: t.common.unknownLocation,
          paletteSize,
        })
        if (requestId !== uploadIdRef.current) return
        setOriginalPhoto(photo)
        setBaseConfig(cardConfig)
        setIsMockPhoto(isMock)
        setPaletteOverride(null)
        setLocationOverride(null)
        setCapturedAtOverride(null)
        // 新图已按当前 paletteSize 提取，同步 ref 免得重提取 effect 立刻多跑一次
        lastExtractedSize.current = paletteSize
      } catch {
        if (requestId !== uploadIdRef.current) return
        setProcessingError(t.common.imageLoadFailed)
      } finally {
        if (requestId === uploadIdRef.current) setIsProcessing(false)
      }
    },
    [language, template, marginPx, paletteSize, t.common.unknownLocation, t.common.imageLoadFailed]
  )

  useEffect(() => {
    if (!MOCK_ENABLED || hasLoadedMockPhoto.current) return
    hasLoadedMockPhoto.current = true
    fetchMockPhoto()
      .then((file) => handleFileSelected(file, true))
      .catch(() => undefined)
  }, [handleFileSelected])

  useEffect(() => {
    if (!originalPhoto) return
    let cancelled = false
    applyFilterToImage(originalPhoto, filter).then((filtered) => {
      if (!cancelled) setDisplayPhoto(filtered)
    })
    return () => {
      cancelled = true
    }
  }, [originalPhoto, filter])

  const handlePaletteColorChange = useCallback(
    (index: number, newHex: string) => {
      if (!config) return
      const current = paletteOverride ?? config.palette
      const updated = current.map((entry, i) => (i === index ? updatePaletteEntryColor(entry, newHex) : entry))
      setPaletteOverride(updated)
    },
    [config, paletteOverride]
  )

  const handlePaletteMove = useCallback(
    (index: number, direction: 'up' | 'down') => {
      if (!config) return
      const current = paletteOverride ?? config.palette
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= current.length) return
      const updated = [...current]
      const movedEntry = updated[index]
      updated[index] = updated[targetIndex]
      updated[targetIndex] = movedEntry
      setPaletteOverride(updated)
    },
    [config, paletteOverride]
  )

  const handleReextractPalette = useCallback(async () => {
    if (!originalPhoto) return
    setIsExtractingColors(true)
    try {
      setPaletteOverride(await extractPaletteEntries(originalPhoto, paletteSize))
    } finally {
      setIsExtractingColors(false)
    }
  }, [originalPhoto, paletteSize])

  // 改变色块数量时立即按新数量重新取色，卡片所见即所得；
  // 用 ref 记录上次提取的数量，跳过与首次上传一致的情况，避免重复劳动。
  const lastExtractedSize = useRef(paletteSize)
  useEffect(() => {
    if (!originalPhoto || paletteSize === lastExtractedSize.current) return
    lastExtractedSize.current = paletteSize
    let cancelled = false
    setIsExtractingColors(true)
    extractPaletteEntries(originalPhoto, paletteSize)
      .then((entries) => {
        if (!cancelled) setPaletteOverride(entries)
      })
      .finally(() => {
        if (!cancelled) setIsExtractingColors(false)
      })
    return () => {
      cancelled = true
    }
  }, [originalPhoto, paletteSize])

  const handleGenerateCardFromGrid = useCallback(
    (canvas: HTMLCanvasElement) => {
      canvas.toBlob((blob) => {
        if (!blob) return
        const file = new File([blob], 'hueframe-grid-result.png', { type: 'image/png' })
        handleFileSelected(file)
        setActiveTab('card')
      }, 'image/png')
    },
    [handleFileSelected]
  )

  const switchTemplate = useCallback((direction: -1 | 1) => {
    setTemplate((current) => {
      const currentIndex = TEMPLATE_IDS.indexOf(current)
      return TEMPLATE_IDS[(currentIndex + direction + TEMPLATE_IDS.length) % TEMPLATE_IDS.length]
    })
  }, [])

  const handleShowAllTemplates = useCallback(() => {
    setIsTemplatePickerOpen(true)
  }, [])

  const handleTemplateSelect = useCallback((id: TemplateId) => {
    setTemplate(id)
    setIsTemplatePickerOpen(false)
  }, [])

  return (
    <div className="h-dvh overflow-hidden">
      <div className={`h-full overflow-y-auto ${(activeTab === 'card' && config) || activeTab === 'grid' ? 'pb-36' : 'pb-24'}`}>
        <TopBar
          onHome={activeTab === 'home' ? undefined : () => setActiveTab('home')}
          tabs={activeTab === 'grid' && <GridSubTabSwitcher value={gridSubTab} onChange={setGridSubTab} />}
        />

      {activeTab === 'card' && (
        <>
          {!baseConfig && <EmptyState onFileSelected={handleFileSelected} />}

          {isProcessing && <LoadingOverlay label={t.common.processing} />}
          {processingError && (
            <p role="alert" className="type-label px-5 py-3 text-error">
              {processingError}
            </p>
          )}

          {config && (
            <>
              <CardPreview
                config={config}
                renderer={RENDERERS[template]}
                templateName={t.templatePicker[template]}
                isMock={isMockPhoto}
                onPreviousTemplate={() => switchTemplate(-1)}
                onNextTemplate={() => switchTemplate(1)}
                onShowAllTemplates={handleShowAllTemplates}
                onReady={setExportCanvas}
              />

              {isTemplatePickerOpen && (
                <TemplatePicker
                  selected={template}
                  onSelect={handleTemplateSelect}
                  onClose={() => setIsTemplatePickerOpen(false)}
                />
              )}

              <CardTabs
                active={activeSubTab}
                onSelect={setActiveSubTab}
                filterPanel={
                  originalPhoto && <FilterPicker selected={filter} photo={originalPhoto} onSelect={setFilter} />
                }
                layoutPanel={
                  <MarginSlider valuePx={marginPx} onChange={setMarginPx} />
                }
                palettePanel={
                  <PaletteControls
                    marginPx={marginPx}
                    swatchGapPx={swatchGapPx}
                    swatchRadiusPx={swatchRadiusPx}
                    paletteSize={paletteSize}
                    isExtracting={isExtractingColors}
                    onReextract={handleReextractPalette}
                    onMarginChange={setMarginPx}
                    onSwatchGapChange={setSwatchGapPx}
                    onSwatchRadiusChange={setSwatchRadiusPx}
                    onPaletteSizeChange={setPaletteSize}
                  >
                    <div>
                      <div className="mb-3 text-base text-on-surface-variant">{t.cardTabs.colorNameLanguage}</div>
                      <LanguagePicker selected={language} onSelect={setLanguage} />
                    </div>
                    <div>
                      <div className="mb-3 text-base text-on-surface-variant">{t.cardTabs.colorFormat}</div>
                      <div className="grid grid-cols-3 gap-3">
                        {COLOR_FORMATS.map((format) => (
                          <Button
                            key={format}
                            variant={colorFormat === format ? 'secondary' : 'outline'}
                            size="sm"
                            className="h-12 bg-surface"
                            aria-pressed={colorFormat === format}
                            onClick={() => setColorFormat(format)}
                          >
                            {t.cardTabs.colorFormatValue[format]}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <PaletteList
                      palette={config.palette}
                      language={language}
                      colorFormat={colorFormat}
                      onColorChange={handlePaletteColorChange}
                      onMove={handlePaletteMove}
                    />
                  </PaletteControls>
                }
                infoPanel={
                  <InfoPanel
                    locationName={config.locationName}
                    capturedAtText={config.capturedAtText}
                    watermarkEnabled={watermarkEnabled}
                    watermarkOpacity={watermarkOpacity}
                    onLocationChange={setLocationOverride}
                    onCapturedAtChange={setCapturedAtOverride}
                    onWatermarkToggle={setWatermarkEnabled}
                    onWatermarkOpacityChange={setWatermarkOpacity}
                  />
                }
              />

              <ExportButton
                canvas={exportCanvas}
                fileName="hueframe-card.png"
                onFilesReplaced={([file]) => file && handleFileSelected(file)}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'home' && (
        <HomeTab onSelectCard={() => setActiveTab('card')} onSelectGrid={() => setActiveTab('grid')} />
      )}

      {activeTab === 'grid' && (
        <GridTool activeSubTab={gridSubTab} onGenerateCard={handleGenerateCardFromGrid} />
      )}

      {activeTab === 'crop' && (
        <CropPanel
          onCropped={(file) => {
            handleFileSelected(file)
            setActiveTab('card')
          }}
          onCancel={() => setActiveTab('home')}
        />
      )}
      </div>

      {activeTab !== 'home' && <BottomNav active={activeTab} onSelect={setActiveTab} />}
    </div>
  )
}
