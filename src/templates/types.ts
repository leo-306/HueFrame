import type { RGB } from '../lib/colorExtraction'
import type { ColorName } from '../lib/colorNames'

export interface PaletteEntry {
  rgb: RGB
  hex: string
  name: ColorName
  textColor: '#ffffff' | '#000000'
  percentage?: number
}

export type ColorNameLanguage = 'zh' | 'en'

export interface CardConfig {
  photo: HTMLImageElement
  palette: PaletteEntry[]
  locationName: string
  capturedAtText: string
  titleFont: string
  width: number
  height: number
  colorNameLanguage: ColorNameLanguage
  marginPx?: number
  watermarkEnabled?: boolean
}

export type TemplateRenderer = (ctx: CanvasRenderingContext2D, config: CardConfig) => void
