import { describe, it, expect } from 'vitest'
import { distanceSquared, rgbToHex, hexToRgb } from './colorMath'

describe('distanceSquared', () => {
  it('returns 0 for identical colors', () => {
    expect(distanceSquared([10, 20, 30], [10, 20, 30])).toBe(0)
  })

  it('returns the sum of squared channel differences', () => {
    expect(distanceSquared([0, 0, 0], [1, 2, 3])).toBe(1 + 4 + 9)
  })
})

describe('rgbToHex', () => {
  it('converts RGB to a lowercase hex string', () => {
    expect(rgbToHex([230, 60, 80])).toBe('#e63c50')
  })

  it('pads single-digit hex values with a leading zero', () => {
    expect(rgbToHex([0, 5, 255])).toBe('#0005ff')
  })
})

describe('hexToRgb', () => {
  it('converts a hex string to RGB', () => {
    expect(hexToRgb('#e63c50')).toEqual([230, 60, 80])
  })

  it('is case-insensitive', () => {
    expect(hexToRgb('#E63C50')).toEqual([230, 60, 80])
  })
})
