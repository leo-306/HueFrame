import type { RGB } from './colorExtraction'

function relativeLuminance([r, g, b]: RGB): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const [rl, gl, bl] = [toLinear(r), toLinear(g), toLinear(b)]
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * 根据 WCAG 相对亮度公式，选出与背景色对比度最高的文字色（黑或白）。
 */
export function pickReadableTextColor(background: RGB): '#ffffff' | '#000000' {
  const bgLuminance = relativeLuminance(background)
  const whiteContrast = contrastRatio(bgLuminance, 1.0)
  const blackContrast = contrastRatio(bgLuminance, 0.0)
  return whiteContrast >= blackContrast ? '#ffffff' : '#000000'
}
