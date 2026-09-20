import { describe, expect, it } from 'vitest'
import { fitWithin } from './imageScale'

describe('fitWithin', () => {
  it('keeps images already within the limit untouched', () => {
    expect(fitWithin(400, 300, 512)).toEqual({ width: 400, height: 300 })
  })

  it('scales a landscape image down to the long edge', () => {
    const r = fitWithin(4000, 3000, 512)
    expect(r.width).toBe(512)
    expect(r.height).toBe(384)
  })

  it('scales a portrait image down to the long edge', () => {
    const r = fitWithin(3000, 4000, 512)
    expect(r.height).toBe(512)
    expect(r.width).toBe(384)
  })

  it('preserves aspect ratio', () => {
    const r = fitWithin(1919, 820, 512)
    expect(r.width / r.height).toBeCloseTo(1919 / 820, 1)
    expect(Math.max(r.width, r.height)).toBe(512)
  })

  it('never returns a zero dimension', () => {
    const r = fitWithin(10000, 1, 512)
    expect(r.width).toBe(512)
    expect(r.height).toBeGreaterThanOrEqual(1)
  })

  it('returns zero for a degenerate source', () => {
    expect(fitWithin(0, 0, 512)).toEqual({ width: 0, height: 0 })
  })
})
