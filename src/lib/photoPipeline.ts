import { extractPalette } from './colorExtraction'
import { rgbToHex } from './colorMath'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import { parsePhotoMeta } from './exifParser'
import { resolveLocationName } from './geocoding'
import { computePalettePercentages } from './paletteWeights'
import type { CardConfig, ColorNameLanguage, PaletteEntry } from '../templates/types'

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}

export interface CardOptions {
  width: number
  height: number
  titleFont: string
  colorNameLanguage: ColorNameLanguage
  unknownLocationLabel: string
}

export async function extractPaletteEntries(photo: HTMLImageElement): Promise<PaletteEntry[]> {
  const rawPalette = await extractPalette(photo, 6)
  const percentages = computePalettePercentages(photo, rawPalette)

  return rawPalette
    .map((rgb, index) => ({
      rgb,
      hex: rgbToHex(rgb),
      name: nearestColorName(rgb),
      textColor: pickReadableTextColor(rgb),
      percentage: percentages[index],
    }))
    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
}

/**
 * 整条处理管线：文件 → EXIF/GPS/取色/占比 → 组装成可直接传给版式渲染器的 CardConfig。
 * GPS 缺失时地点显示 options.unknownLocationLabel，拍摄时间缺失时留空，不阻塞主流程。
 */
export async function buildCardConfig(
  file: File,
  photo: HTMLImageElement,
  options: CardOptions
): Promise<CardConfig> {
  const [meta, palette] = await Promise.all([parsePhotoMeta(file), extractPaletteEntries(photo)])

  const locationName = meta.gps ? await resolveLocationName(meta.gps) : options.unknownLocationLabel
  const capturedAtText = meta.capturedAt ? formatDate(meta.capturedAt) : ''
  return {
    photo,
    palette,
    locationName,
    capturedAtText,
    titleFont: options.titleFont,
    width: options.width,
    height: options.height,
    colorNameLanguage: options.colorNameLanguage,
  }
}
