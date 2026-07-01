import { describe, it, expect } from 'vitest'
import { extractPalette } from './colorExtraction'

function createSolidColorCanvas(r: number, g: number, b: number, size = 50): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, size, size)
  return canvas
}

describe('extractPalette', () => {
  it('extracts a dominant color close to the solid fill color', async () => {
    const canvas = createSolidColorCanvas(200, 50, 50)
    const palette = await extractPalette(canvas, 5)

    expect(palette.length).toBeGreaterThan(0)
    const [r, g, b] = palette[0]
    // 允许量化误差
    expect(r).toBeGreaterThan(150)
    expect(g).toBeLessThan(100)
    expect(b).toBeLessThan(100)
  })

  it('returns the requested number of colors at most', async () => {
    const canvas = createSolidColorCanvas(10, 20, 30)
    const palette = await extractPalette(canvas, 3)
    expect(palette.length).toBeLessThanOrEqual(3)
  })
})
