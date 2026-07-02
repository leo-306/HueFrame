import { useCallback, useEffect, useMemo, useState } from 'react'
import { TopBar } from './components/TopBar'
import { BottomNav, type AppTab } from './components/BottomNav'
import { EmptyState } from './components/EmptyState'
import { CardTabs, type CardSubTab } from './components/CardTabs'
import { FilterPicker } from './components/FilterPicker'
import { TemplatePicker, type TemplateId } from './components/TemplatePicker'
import { AspectRatioPicker } from './components/AspectRatioPicker'
import { MarginSlider } from './components/MarginSlider'
import { PaletteList } from './components/PaletteList'
import { InfoPanel } from './components/InfoPanel'
import { CardPreview } from './components/CardPreview'
import { ExportButton } from './components/ExportButton'
import { buildCardConfig } from './lib/photoPipeline'
import { applyFilter, type FilterName } from './lib/filters'
import { dimensionsForAspectRatio, type AspectRatioId } from './lib/aspectRatio'
import { updatePaletteEntryColor } from './lib/paletteEditing'
import { renderClassicStrip } from './templates/classicStrip'
import { renderMagazineCover } from './templates/magazineCover'
import type { CardConfig, ColorNameLanguage, PaletteEntry, TemplateRenderer } from './templates/types'

const RENDERERS: Record<TemplateId, TemplateRenderer> = {
  classicStrip: renderClassicStrip,
  magazineCover: renderMagazineCover,
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function applyFilterToImage(photo: HTMLImageElement, filter: FilterName): Promise<HTMLImageElement> {
  const canvas = document.createElement('canvas')
  canvas.width = photo.naturalWidth
  canvas.height = photo.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(photo, 0, 0)
  applyFilter(canvas, filter)

  return new Promise((resolve) => {
    const filtered = new Image()
    filtered.onload = () => resolve(filtered)
    filtered.src = canvas.toDataURL()
  })
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('card')
  const [activeSubTab, setActiveSubTab] = useState<CardSubTab>('filter')

  // originalPhoto + baseConfig 保存取色/EXIF 等一次性处理结果（基于未加滤镜的原图，
  // 保证色卡反映照片真实色彩）；滤镜只影响展示用的 displayPhoto，不重新提取颜色。
  const [originalPhoto, setOriginalPhoto] = useState<HTMLImageElement | null>(null)
  const [baseConfig, setBaseConfig] = useState<CardConfig | null>(null)
  const [displayPhoto, setDisplayPhoto] = useState<HTMLImageElement | null>(null)

  // 调色/信息 Tab 的手动编辑覆盖值：未编辑时为 null，读取 baseConfig 里的自动识别结果。
  const [paletteOverride, setPaletteOverride] = useState<PaletteEntry[] | null>(null)
  const [locationOverride, setLocationOverride] = useState<string | null>(null)
  const [capturedAtOverride, setCapturedAtOverride] = useState<string | null>(null)

  const [template, setTemplate] = useState<TemplateId>('classicStrip')
  const [filter, setFilter] = useState<FilterName>('none')
  const [language, setLanguage] = useState<ColorNameLanguage>('zh')
  const [aspectRatio, setAspectRatio] = useState<AspectRatioId>('4:5')
  const [marginPx, setMarginPx] = useState(24)
  const [watermarkEnabled, setWatermarkEnabled] = useState(true)

  const [isProcessing, setIsProcessing] = useState(false)
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null)

  const { width, height } = dimensionsForAspectRatio(aspectRatio)

  const config = useMemo(() => {
    if (!baseConfig || !displayPhoto) return null
    return {
      ...baseConfig,
      photo: displayPhoto,
      colorNameLanguage: language,
      width,
      height,
      marginPx,
      watermarkEnabled,
      palette: paletteOverride ?? baseConfig.palette,
      locationName: locationOverride ?? baseConfig.locationName,
      capturedAtText: capturedAtOverride ?? baseConfig.capturedAtText,
    }
  }, [
    baseConfig,
    displayPhoto,
    language,
    width,
    height,
    marginPx,
    watermarkEnabled,
    paletteOverride,
    locationOverride,
    capturedAtOverride,
  ])

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      try {
        const photo = await loadImage(file)
        const cardConfig = await buildCardConfig(file, photo, {
          width,
          height,
          titleFont: 'Georgia, serif',
          colorNameLanguage: language,
        })
        setOriginalPhoto(photo)
        setBaseConfig(cardConfig)
        setPaletteOverride(null)
        setLocationOverride(null)
        setCapturedAtOverride(null)
      } finally {
        setIsProcessing(false)
      }
    },
    [language]
  )

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

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <TopBar language={language} onLanguageChange={setLanguage} />

      {activeTab === 'card' && (
        <>
          {!baseConfig && <EmptyState onFileSelected={handleFileSelected} />}

          {isProcessing && <p>处理中…</p>}

          {config && (
            <>
              <CardPreview config={config} renderer={RENDERERS[template]} onReady={setExportCanvas} />

              <CardTabs
                active={activeSubTab}
                onSelect={setActiveSubTab}
                filterPanel={
                  originalPhoto && <FilterPicker selected={filter} photo={originalPhoto} onSelect={setFilter} />
                }
                layoutPanel={
                  <>
                    <TemplatePicker selected={template} onSelect={setTemplate} />
                    <AspectRatioPicker selected={aspectRatio} onSelect={setAspectRatio} />
                    <MarginSlider valuePx={marginPx} onChange={setMarginPx} />
                  </>
                }
                palettePanel={
                  <PaletteList
                    palette={config.palette}
                    language={language}
                    onColorChange={handlePaletteColorChange}
                  />
                }
                infoPanel={
                  <InfoPanel
                    locationName={config.locationName}
                    capturedAtText={config.capturedAtText}
                    watermarkEnabled={watermarkEnabled}
                    onLocationChange={setLocationOverride}
                    onCapturedAtChange={setCapturedAtOverride}
                    onWatermarkToggle={setWatermarkEnabled}
                  />
                }
              />

              <ExportButton canvas={exportCanvas} fileName="hueframe-card.png" />
            </>
          )}
        </>
      )}

      {activeTab !== 'card' && <p>敬请期待</p>}

      <BottomNav active={activeTab} onSelect={setActiveTab} />
    </div>
  )
}
