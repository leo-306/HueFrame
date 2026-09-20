import { describe, expect, it } from 'vitest'
import { deltaE, rgbToLab } from './colorMath'
import {
  PALETTE_MINIMUM,
  PALETTE_TARGET,
  buildDistinctPalette,
  dedupePaletteColors,
  dropNegligiblePercentages,
} from './paletteDedup'

type RGB = [number, number, number]

describe('deltaE', () => {
  it('reports zero for identical colors', () => {
    expect(deltaE([255, 255, 255], [255, 255, 255])).toBe(0)
  })

  it('separates hues that share similar lightness', () => {
    expect(deltaE([200, 40, 40], [40, 160, 60])).toBeGreaterThan(20)
  })
})

describe('rgbToLab', () => {
  it('puts white near the L* ceiling and black at the floor', () => {
    expect(rgbToLab([255, 255, 255])[0]).toBeCloseTo(100, 0)
    expect(rgbToLab([0, 0, 0])[0]).toBeCloseTo(0, 5)
  })
})

describe('dedupePaletteColors', () => {
  it('collapses the three off-whites a real photo quantized into one', () => {
    const deduped = dedupePaletteColors([
      [243, 243, 236],
      [209, 219, 207],
      [199, 209, 194],
      [90, 60, 40],
    ])
    expect(deduped).toHaveLength(2)
    expect(deduped[0]).toEqual([243, 243, 236])
    expect(deduped[1]).toEqual([90, 60, 40])
  })

  it('keeps every clearly distinct color', () => {
    const colors: RGB[] = [
      [200, 40, 40],
      [40, 160, 60],
      [40, 80, 200],
      [240, 220, 40],
    ]
    expect(dedupePaletteColors(colors)).toHaveLength(4)
  })

  it('preserves the incoming prominence order', () => {
    const deduped = dedupePaletteColors([
      [10, 10, 10],
      [240, 240, 240],
      [14, 12, 12],
      [12, 10, 14],
    ])
    expect(deduped.map(([r]) => r)).toEqual([10, 240])
  })
})

describe('buildDistinctPalette', () => {
  it('returns the target count of well-separated colors for a colorful photo', () => {
    const colorful: RGB[] = [
      [214, 69, 80],
      [46, 125, 91],
      [242, 193, 78],
      [43, 74, 139],
      [232, 227, 217],
      [107, 63, 42],
      [180, 200, 90],
    ]
    const palette = buildDistinctPalette(colorful)
    expect(palette).toHaveLength(PALETTE_TARGET)
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        expect(deltaE(palette[i], palette[j])).toBeGreaterThanOrEqual(10)
      }
    }
  })

  it('returns fewer swatches rather than near-duplicates when the photo has little variety', () => {
    // 实测首页卡片背景图的 12 个候选色：彼此 ΔE 都很小，凑不出 6 块。
    const flat: RGB[] = [
      [249, 247, 241],
      [180, 192, 175],
      [204, 214, 200],
      [225, 229, 218],
      [211, 221, 212],
      [187, 202, 188],
      [227, 235, 228],
      [237, 236, 228],
      [220, 220, 212],
      [198, 196, 188],
      [236, 228, 228],
    ]
    const palette = buildDistinctPalette(flat)
    expect(palette.length).toBeLessThan(PALETTE_TARGET)
    expect(palette.length).toBeGreaterThanOrEqual(PALETTE_MINIMUM)
    for (let i = 0; i < palette.length; i++) {
      for (let j = i + 1; j < palette.length; j++) {
        expect(deltaE(palette[i], palette[j])).toBeGreaterThanOrEqual(10)
      }
    }
  })

  it('pads to the minimum for a nearly monochrome photo so the strip still reads as a palette', () => {
    const monochrome: RGB[] = [
      [241, 235, 227],
      [251, 249, 245],
      [252, 243, 235],
      [228, 222, 214],
      [223, 212, 204],
      [221, 209, 195],
    ]
    const palette = buildDistinctPalette(monochrome)
    expect(palette.length).toBeGreaterThanOrEqual(PALETTE_MINIMUM)
  })

  it('terminates when every candidate is the same color', () => {
    // 回归：早先的实现反复把阈值除以 1.5，非规格化数上停滞（5e-324/1.5 === 5e-324），
    // 纯色照片会让取色流程死循环，整个应用卡住。
    const identical: RGB[] = Array.from({ length: 6 }, () => [10, 10, 10] as RGB)
    expect(() => buildDistinctPalette(identical)).not.toThrow()
    expect(buildDistinctPalette(identical).length).toBeGreaterThan(0)
  })

  it('never exceeds the target count', () => {
    const many: RGB[] = Array.from({ length: 40 }, (_, i) => [i * 6, 255 - i * 6, 128] as RGB)
    expect(buildDistinctPalette(many).length).toBeLessThanOrEqual(PALETTE_TARGET)
  })
})

describe('dropNegligiblePercentages', () => {
  it('removes near-zero swatches left behind by merging', () => {
    expect(dropNegligiblePercentages([81, 15, 2, 0, 0, 0])).toEqual([81, 15, 2])
  })

  it('keeps the whole list when nothing is negligible', () => {
    expect(dropNegligiblePercentages([40, 30, 20, 10])).toEqual([40, 30, 20, 10])
  })

  it('returns the list untouched when every share is negligible', () => {
    expect(dropNegligiblePercentages([0, 0])).toEqual([0, 0])
  })
})
