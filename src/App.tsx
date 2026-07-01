import { useCallback, useEffect, useMemo, useState } from 'react'
import { UploadZone } from './components/UploadZone'
import { TemplatePicker, type TemplateId } from './components/TemplatePicker'
import { FilterPicker } from './components/FilterPicker'
import { LanguagePicker } from './components/LanguagePicker'
import { CardPreview } from './components/CardPreview'
import { ExportButton } from './components/ExportButton'
import { buildCardConfig } from './lib/photoPipeline'
import { applyFilter, type FilterName } from './lib/filters'
import { renderClassicStrip } from './templates/classicStrip'
import { renderMagazineCover } from './templates/magazineCover'
import type { CardConfig, ColorNameLanguage, TemplateRenderer } from './templates/types'

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
  // originalPhoto + baseConfig 保存取色/EXIF 等一次性处理结果（基于未加滤镜的原图，
  // 保证色卡反映照片真实色彩）；colorNameLanguage 独立成 state 是因为切换语言只需要
  // 换文字、不需要重跑取色和 EXIF 解析；滤镜只影响展示用的 photo，不重新提取颜色。
  const [originalPhoto, setOriginalPhoto] = useState<HTMLImageElement | null>(null)
  const [baseConfig, setBaseConfig] = useState<CardConfig | null>(null)
  const [displayPhoto, setDisplayPhoto] = useState<HTMLImageElement | null>(null)
  const [template, setTemplate] = useState<TemplateId>('classicStrip')
  const [filter, setFilter] = useState<FilterName>('none')
  const [language, setLanguage] = useState<ColorNameLanguage>('zh')
  const [isProcessing, setIsProcessing] = useState(false)
  const [exportCanvas, setExportCanvas] = useState<HTMLCanvasElement | null>(null)

  const config = useMemo(
    () =>
      baseConfig && displayPhoto
        ? { ...baseConfig, photo: displayPhoto, colorNameLanguage: language }
        : null,
    [baseConfig, displayPhoto, language]
  )

  const handleFileSelected = useCallback(async (file: File) => {
    setIsProcessing(true)
    try {
      const photo = await loadImage(file)
      const cardConfig = await buildCardConfig(file, photo, {
        width: 800,
        height: 1000,
        titleFont: 'Georgia, serif',
        colorNameLanguage: language,
      })
      setOriginalPhoto(photo)
      setBaseConfig(cardConfig)
    } finally {
      setIsProcessing(false)
    }
  }, [language])

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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>
      <h1>HueFrame</h1>
      <UploadZone onFileSelected={handleFileSelected} />

      {isProcessing && <p>处理中…</p>}

      {config && (
        <>
          <FilterPicker selected={filter} onSelect={setFilter} />
          <TemplatePicker selected={template} onSelect={setTemplate} />
          <LanguagePicker selected={language} onSelect={setLanguage} />
          <CardPreview config={config} renderer={RENDERERS[template]} onReady={setExportCanvas} />
          <ExportButton canvas={exportCanvas} fileName="hueframe-card.png" />
        </>
      )}
    </div>
  )
}
