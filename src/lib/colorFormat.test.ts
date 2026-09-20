import { describe, expect, it } from 'vitest'
import { contrastRatio, rgbToHsl } from './colorMath'
import { bestContrastRatio, formatColorValue } from './colorFormat'

describe('rgbToHsl', () => {
  it('maps pure red', () => {
    expect(rgbToHsl([255, 0, 0])).toEqual([0, 100, 50])
  })

  it('maps pure green', () => {
    expect(rgbToHsl([0, 255, 0])).toEqual([120, 100, 50])
  })

  it('maps pure blue', () => {
    expect(rgbToHsl([0, 0, 255])).toEqual([240, 100, 50])
  })

  it('maps achromatic colors to zero saturation', () => {
    expect(rgbToHsl([128, 128, 128])).toEqual([0, 0, 50])
    expect(rgbToHsl([255, 255, 255])).toEqual([0, 0, 100])
    expect(rgbToHsl([0, 0, 0])).toEqual([0, 0, 0])
  })

  it('keeps hue in range for a mid olive', () => {
    const [h, s, l] = rgbToHsl([196, 212, 108])
    expect(h).toBeGreaterThanOrEqual(0)
    expect(h).toBeLessThan(360)
    expect(s).toBeGreaterThan(0)
    expect(l).toBeGreaterThan(0)
  })
})

describe('contrastRatio', () => {
  it('is 1 for identical colors and 21 for black on white', () => {
    expect(contrastRatio([10, 20, 30], [10, 20, 30])).toBeCloseTo(1, 5)
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1)
  })

  it('is symmetric', () => {
    const a = contrastRatio([214, 69, 80], [232, 227, 217])
    const b = contrastRatio([232, 227, 217], [214, 69, 80])
    expect(a).toBeCloseTo(b, 10)
  })
})

describe('formatColorValue', () => {
  const rgb: [number, number, number] = [44, 76, 139]

  it('renders uppercase hex', () => {
    expect(formatColorValue(rgb, 'hex')).toBe('#2C4C8B')
  })

  it('renders rgb', () => {
    expect(formatColorValue(rgb, 'rgb')).toBe('rgb(44, 76, 139)')
  })

  it('renders hsl', () => {
    expect(formatColorValue(rgb, 'hsl')).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/)
  })
})

describe('bestContrastRatio', () => {
  it('takes the stronger of contrast against black or white', () => {
    // 近白对白底对比低，但对黑底很高
    expect(bestContrastRatio([250, 250, 250])).toBeGreaterThan(15)
    // 纯黑对黑底为 1，但对白底 21
    expect(bestContrastRatio([0, 0, 0])).toBeCloseTo(21, 1)
    // 中灰对黑约 5.3、对白约 3.9，取较大者
    expect(bestContrastRatio([128, 128, 128])).toBeCloseTo(5.32, 1)
  })

  it('always returns at least 1', () => {
    for (const v of [0, 64, 128, 200, 255]) {
      expect(bestContrastRatio([v, v, v])).toBeGreaterThanOrEqual(1)
    }
  })
})
