import { extractPalette } from './colorExtraction'
import { rgbToHex } from './colorMath'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import { parsePhotoMeta } from './exifParser'
import { resolveLocationName } from './geocoding'
import { computePalettePercentages } from './paletteWeights'
import { buildDistinctPalette, dropNegligiblePercentages } from './paletteDedup'
import { disambiguateColorNames } from './colorNames'
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

/** 色卡展示的色块数量。 */
export const PALETTE_SIZE = 6

export async function extractPaletteEntries(photo: HTMLImageElement): Promise<PaletteEntry[]> {
  // 多取一倍候选色，去重后才凑得出足够多"看得出的差别"的颜色；
  // 占比过低的量化噪声不占展示位，否则一色独大时剩下的都是近乎重复的残色。
  const rawPalette = await extractPalette(photo, PALETTE_SIZE * 2)
  const distinct = buildDistinctPalette(rawPalette)
  const percentages = dropNegligiblePercentages(computePalettePercentages(photo, distinct))

  return disambiguateColorNames(
    distinct
      .slice(0, percentages.length)
      .map((rgb, index) => ({
        rgb,
        hex: rgbToHex(rgb),
        name: nearestColorName(rgb),
        textColor: pickReadableTextColor(rgb),
        percentage: percentages[index],
      }))
  ).sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
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
