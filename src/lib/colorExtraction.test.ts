import { describe, it, expect, vi } from 'vitest'
import ColorThief from 'color-thief-browser'
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

  it('returns an empty array instead of throwing when the image has no extractable colors', async () => {
    // color-thief-browser 会过滤掉接近纯白的像素；纯白图片会导致其
    // 内部量化直方图为空，getPalette 返回 null。
    const canvas = createSolidColorCanvas(255, 255, 255)
    const palette = await extractPalette(canvas, 5)
    expect(palette).toEqual([])
  })

  it('returns an empty array instead of throwing when color-thief-browser itself throws', async () => {
    // color-thief-browser 的压缩包在某些像素分布下会在内部抛出
    // ReferenceError（已知的第三方库问题，非本项目代码触发）。
    const spy = vi.spyOn(ColorThief.prototype, 'getPalette').mockImplementation(() => {
      throw new ReferenceError('index is not defined')
    })
    const canvas = createSolidColorCanvas(100, 120, 140)
    const palette = await extractPalette(canvas, 5)
    expect(palette).toEqual([])
    spy.mockRestore()
  })
})
