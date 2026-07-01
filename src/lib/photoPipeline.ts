import { extractPalette, type RGB } from './colorExtraction'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import { parsePhotoMeta } from './exifParser'
import { resolveLocationName } from './geocoding'
import type { CardConfig, ColorNameLanguage, PaletteEntry } from '../templates/types'

function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export interface CardOptions {
  width: number
  height: number
  titleFont: string
  colorNameLanguage: ColorNameLanguage
}

/**
 * 整条处理管线：文件 → EXIF/GPS/取色 → 组装成可直接传给版式渲染器的 CardConfig。
 * GPS 缺失时地点显示"未知地点"，拍摄时间缺失时留空，不阻塞主流程。
 */
export async function buildCardConfig(
  file: File,
  photo: HTMLImageElement,
  options: CardOptions
): Promise<CardConfig> {
  const [meta, rawPalette] = await Promise.all([parsePhotoMeta(file), extractPalette(photo, 6)])

  const locationName = meta.gps ? await resolveLocationName(meta.gps) : '未知地点'
  const capturedAtText = meta.capturedAt ? formatDate(meta.capturedAt) : ''

  const palette: PaletteEntry[] = rawPalette.map((rgb) => ({
    rgb,
    hex: rgbToHex(rgb),
    name: nearestColorName(rgb),
    textColor: pickReadableTextColor(rgb),
  }))

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
