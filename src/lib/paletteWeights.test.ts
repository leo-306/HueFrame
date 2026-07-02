import { describe, it, expect } from 'vitest'
import { computePalettePercentages } from './paletteWeights'

function createSplitCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 40
  canvas.height = 40
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgb(255,0,0)'
  ctx.fillRect(0, 0, 10, 40)
  ctx.fillStyle = 'rgb(0,0,255)'
  ctx.fillRect(10, 0, 30, 40)
  return canvas
}

describe('computePalettePercentages', () => {
  it('assigns higher percentage to the color covering more area', () => {
    const canvas = createSplitCanvas()
    const percentages = computePalettePercentages(canvas, [
      [255, 0, 0],
      [0, 0, 255],
    ])
    expect(percentages.length).toBe(2)
    expect(percentages[1]).toBeGreaterThan(percentages[0])
    expect(percentages[0] + percentages[1]).toBeCloseTo(100, 0)
  })

  it('returns 100 for a single-color palette', () => {
    const canvas = createSplitCanvas()
    const percentages = computePalettePercentages(canvas, [[255, 0, 0]])
    expect(percentages).toEqual([100])
  })

  it('returns an empty array for an empty palette', () => {
    const canvas = createSplitCanvas()
    expect(computePalettePercentages(canvas, [])).toEqual([])
  })
})
