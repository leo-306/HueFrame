import type { RGB } from './colorExtraction'
import { contrastRatio, rgbToHex, rgbToHsl } from './colorMath'

/** 色卡上可选的色值格式。调研主流色卡工具（Coolors / 9grid / 懒人工具）均提供多种格式。 */
export const COLOR_FORMATS = ['hex', 'rgb', 'hsl'] as const
export type ColorFormat = (typeof COLOR_FORMATS)[number]

const WHITE: RGB = [255, 255, 255]
const BLACK: RGB = [0, 0, 0]

/** 把 RGB 按指定格式渲染成展示字符串。 */
export function formatColorValue(rgb: RGB, format: ColorFormat): string {
  if (format === 'rgb') return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  if (format === 'hsl') {
    const [h, s, l] = rgbToHsl(rgb)
    return `hsl(${h}, ${s}%, ${l}%)`
  }
  return rgbToHex(rgb).toUpperCase()
}

/**
 * 该颜色与白底、黑底的对比度中较高的一个。色卡本身用来自动选黑/白文字，
 * 这个值告诉用户"这块颜色最多能撑起多强的可读性"。
 */
export function bestContrastRatio(rgb: RGB): number {
  return Math.max(contrastRatio(rgb, WHITE), contrastRatio(rgb, BLACK))
}
