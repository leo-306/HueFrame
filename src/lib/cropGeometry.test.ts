import { describe, expect, it } from 'vitest'
import {
  CROP_RATIOS,
  MAX_SCALE,
  MIN_SCALE,
  baseCropSize,
  computeCropRect,
  croppedExportSize,
} from './cropGeometry'

describe('baseCropSize', () => {
  it('fits the ratio inside a landscape source', () => {
    // 1000x500 的图配 1:1：宽度受源高限制
    expect(baseCropSize(1000, 500, 1)).toEqual({ width: 500, height: 500 })
  })

  it('fits the ratio inside a portrait source', () => {
    expect(baseCropSize(500, 1000, 1)).toEqual({ width: 500, height: 500 })
  })

  it('returns nothing for a degenerate source', () => {
    expect(baseCropSize(0, 0, 1)).toEqual({ width: 0, height: 0 })
  })
})

describe('computeCropRect', () => {
  it('centres the crop and covers the frame at scale 1', () => {
    const rect = computeCropRect(1000, 800, { ratio: 1, scale: 1, offsetX: 0, offsetY: 0 })
    expect(rect).toEqual({ x: 100, y: 0, width: 800, height: 800 })
  })

  it('shrinks the rect as scale grows', () => {
    const rect = computeCropRect(1000, 800, { ratio: 1, scale: 2, offsetX: 0, offsetY: 0 })
    expect(rect.width).toBe(400)
    expect(rect.height).toBe(400)
    expect(rect.x).toBe(300)
    expect(rect.y).toBe(200)
  })

  it('never lets the rect escape the source at the extremes', () => {
    for (const offsetX of [-1, 1]) {
      for (const offsetY of [-1, 1]) {
        const rect = computeCropRect(1000, 800, { ratio: 1, scale: 2, offsetX, offsetY })
        expect(rect.x).toBeGreaterThanOrEqual(0)
        expect(rect.y).toBeGreaterThanOrEqual(0)
        expect(rect.x + rect.width).toBeLessThanOrEqual(1000 + 1e-9)
        expect(rect.y + rect.height).toBeLessThanOrEqual(800 + 1e-9)
      }
    }
  })

  it('clamps out-of-range scale and offsets', () => {
    const rect = computeCropRect(1000, 800, {
      ratio: 1,
      scale: 999,
      offsetX: 99,
      offsetY: -99,
    })
    expect(rect.width).toBe(800 / MAX_SCALE)
    expect(rect.x).toBe(1000 - rect.width)
    expect(rect.y).toBe(0)
  })

  it('keeps the requested ratio at every scale', () => {
    for (const scale of [MIN_SCALE, 1.5, 2.7, MAX_SCALE]) {
      const rect = computeCropRect(1600, 900, { ratio: 16 / 9, scale, offsetX: 0.3, offsetY: -0.4 })
      expect(rect.width / rect.height).toBeCloseTo(16 / 9, 6)
    }
  })

  it('returns an empty rect for a degenerate source', () => {
    expect(computeCropRect(0, 0, { ratio: 1, scale: 1, offsetX: 0, offsetY: 0 })).toEqual({
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    })
  })
})

describe('croppedExportSize', () => {
  it('caps the long edge of a landscape crop', () => {
    expect(croppedExportSize({ x: 0, y: 0, width: 1600, height: 900 })).toEqual({
      width: 1600,
      height: 900,
    })
  })

  it('caps the long edge of a portrait crop', () => {
    expect(croppedExportSize({ x: 0, y: 0, width: 800, height: 1600 })).toEqual({
      width: 800,
      height: 1600,
    })
  })

  it('downscales oversized sources', () => {
    const size = croppedExportSize({ x: 0, y: 0, width: 4000, height: 4000 })
    expect(size.width).toBe(1600)
    expect(size.height).toBe(1600)
  })
})

describe('CROP_RATIOS', () => {
  it('offers the same ratios as the layout tab', () => {
    expect(CROP_RATIOS.map((r) => r.id)).toEqual(['4:5', '1:1', '16:9'])
  })
})
