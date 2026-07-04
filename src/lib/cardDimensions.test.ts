import { describe, expect, it } from 'vitest'
import { dimensionsForTemplate } from './cardDimensions'

describe('dimensionsForTemplate', () => {
  it('keeps the magazine canvas at the original photo ratio', () => {
    expect(dimensionsForTemplate('magazineCover', 1200, 800, 0)).toEqual({
      width: 800,
      height: 533,
    })
  })

  it('adds the palette and information areas below a ratio-preserving classic photo', () => {
    expect(dimensionsForTemplate('classicStrip', 1200, 800, 0)).toEqual({
      width: 800,
      height: 933,
    })
  })

  it('accounts for outer margin without changing the inner photo ratio', () => {
    expect(dimensionsForTemplate('magazineCover', 600, 900, 24)).toEqual({
      width: 800,
      height: 1176,
    })
  })
})
