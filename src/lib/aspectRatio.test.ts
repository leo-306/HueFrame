import { describe, it, expect } from 'vitest'
import { ASPECT_RATIOS, dimensionsForAspectRatio } from './aspectRatio'

describe('dimensionsForAspectRatio', () => {
  it('returns a 4:5 portrait size for "4:5"', () => {
    const { width, height } = dimensionsForAspectRatio('4:5')
    expect(width).toBe(800)
    expect(height).toBe(1000)
  })

  it('returns a square size for "1:1"', () => {
    const { width, height } = dimensionsForAspectRatio('1:1')
    expect(width).toBe(800)
    expect(height).toBe(800)
  })

  it('returns a widescreen size for "16:9"', () => {
    const { width, height } = dimensionsForAspectRatio('16:9')
    expect(width).toBe(800)
    expect(height).toBe(450)
  })

  it('exposes all supported ratios in ASPECT_RATIOS', () => {
    expect(ASPECT_RATIOS).toEqual(['4:5', '1:1', '16:9'])
  })
})
