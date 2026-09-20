import type { RGB } from './colorExtraction'

export function distanceSquared(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

export function rgbToHex([r, g, b]: RGB): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function hexToRgb(hex: string): RGB {
  const normalized = hex.replace('#', '')
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return [r, g, b]
}

export type HSL = [number, number, number]

/** sRGB → HSL。色相取 [0,360)，饱和度与亮度取百分比整数。 */
export function rgbToHsl([r, g, b]: RGB): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const lightness = (max + min) / 2

  let hue = 0
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6
    else if (max === gn) hue = (bn - rn) / delta + 2
    else hue = (rn - gn) / delta + 4
    hue *= 60
    if (hue < 0) hue += 360
  }

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  return [Math.round(hue), Math.round(saturation * 100), Math.round(lightness * 100)]
}

/** 相对亮度（WCAG 2.1 定义），用于对比度计算。 */
function relativeLuminance([r, g, b]: RGB): number {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/**
 * 两个颜色的 WCAG 对比度，范围 [1, 21]。AA 正文需 ≥4.5，AA 大字/UI 需 ≥3。
 */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

export type Lab = [number, number, number]

/** sRGB → CIE L*a*b*（D65 白点），用于按人眼感知而非 RGB 距离判断颜色是否近似。 */
export function rgbToLab([r, g, b]: RGB): Lab {
  const channel = (value: number) => {
    const c = value / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const [lr, lg, lb] = [channel(r), channel(g), channel(b)]

  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883

  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const [fx, fy, fz] = [f(x), f(y), f(z)]

  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** CIE76 色差：约 <2.3 才能察觉差别，>10 属于明显不同的颜色。 */
export function deltaE(a: RGB, b: RGB): number {
  const [l1, a1, b1] = rgbToLab(a)
  const [l2, a2, b2] = rgbToLab(b)
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)
}
