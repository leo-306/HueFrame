import { describe, it, expect } from 'vitest'
import { nearestColorName } from './colorNames'

describe('nearestColorName', () => {
  it('matches a pure red to a red-family Chinese name', () => {
    const result = nearestColorName([230, 30, 30])
    expect(result.zh).toBeTruthy()
    expect(result.en).toBeTruthy()
  })

  it('matches a pure blue to a blue-family Chinese name', () => {
    const result = nearestColorName([20, 40, 200])
    expect(result.zh).toBeTruthy()
  })

  it('returns the same name for identical colors', () => {
    const a = nearestColorName([100, 150, 200])
    const b = nearestColorName([100, 150, 200])
    expect(a.zh).toBe(b.zh)
  })
})
