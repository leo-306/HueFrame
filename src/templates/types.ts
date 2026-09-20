import type { RGB } from '../lib/colorExtraction'
import type { ColorName } from '../lib/colorNames'
import type { ColorFormat } from '../lib/colorFormat'

export interface PaletteEntry {
  rgb: RGB
  hex: string
  name: ColorName
  textColor: '#ffffff' | '#000000'
  percentage?: number
}

export type ColorNameLanguage = 'zh' | 'en'

export type TemplateId =
  | 'classicStrip'
  | 'magazineCover'
  | 'editorialFrame'
  | 'polaroidJournal'
  | 'colorArchive'
  | 'pantoneCard'
  | 'colorAnnotation'
  | 'designerSpec'
  | 'heroHex'
  | 'bandList'
  | 'colorSpectrum'

export interface CardConfig {
  photo: HTMLImageElement
  palette: PaletteEntry[]
  locationName: string
  capturedAtText: string
  titleFont: string
  width: number
  height: number
  colorNameLanguage: ColorNameLanguage
  /** 色卡上色值用哪种格式展示，默认 hex。 */
  colorFormat?: ColorFormat
  marginPx?: number
  swatchGapPx?: number
  swatchRadiusPx?: number
  watermarkEnabled?: boolean
  watermarkOpacity?: number
}

export type TemplateRenderer = (ctx: CanvasRenderingContext2D, config: CardConfig) => void
