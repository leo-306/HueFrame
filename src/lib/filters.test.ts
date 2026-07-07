import { describe, it, expect } from 'vitest'
import { applyFilter, createFilterThumbnail, FILTERS } from './filters'
import { createTestPhoto } from '../../tests/testImage'

function createSolidCanvas(r: number, g: number, b: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 10
  canvas.height = 10
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = `rgb(${r},${g},${b})`
  ctx.fillRect(0, 0, 10, 10)
  return canvas
}

describe('applyFilter', () => {
  it('leaves pixels unchanged for the "none" filter', () => {
    const canvas = createSolidCanvas(100, 150, 200)
    applyFilter(canvas, 'none')
    const ctx = canvas.getContext('2d')!
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    expect([pixel[0], pixel[1], pixel[2]]).toEqual([100, 150, 200])
  })

  it('warms up colors for the "warmFilm" filter', () => {
    const canvas = createSolidCanvas(100, 100, 100)
    applyFilter(canvas, 'warmFilm')
    const ctx = canvas.getContext('2d')!
    const pixel = ctx.getImageData(0, 0, 1, 1).data
    expect(pixel[0]).toBeGreaterThan(100)
    expect(pixel[2]).toBeLessThan(100)
  })

  it('converts colors to grayscale for the "monochrome" filter', () => {
    const canvas = createSolidCanvas(180, 100, 40)
    applyFilter(canvas, 'monochrome')
    const pixel = canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data
    expect(pixel[0]).toBe(pixel[1])
    expect(pixel[1]).toBe(pixel[2])
  })

  it('reduces contrast for the "softFade" filter', () => {
    const darkCanvas = createSolidCanvas(20, 20, 20)
    const lightCanvas = createSolidCanvas(235, 235, 235)
    applyFilter(darkCanvas, 'softFade')
    applyFilter(lightCanvas, 'softFade')
    const dark = darkCanvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[0]
    const light = lightCanvas.getContext('2d')!.getImageData(0, 0, 1, 1).data[0]
    expect(dark).toBeGreaterThan(20)
    expect(light - dark).toBeLessThan(215)
  })

  it('increases color separation for the "vivid" filter', () => {
    const canvas = createSolidCanvas(180, 100, 100)
    applyFilter(canvas, 'vivid')
    const pixel = canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data
    expect(pixel[0] - pixel[1]).toBeGreaterThan(80)
  })

  it('adds teal to shadows and orange to highlights for the "tealOrange" filter', () => {
    const shadowCanvas = createSolidCanvas(40, 40, 40)
    const highlightCanvas = createSolidCanvas(220, 220, 220)
    applyFilter(shadowCanvas, 'tealOrange')
    applyFilter(highlightCanvas, 'tealOrange')
    const shadow = shadowCanvas.getContext('2d')!.getImageData(0, 0, 1, 1).data
    const highlight = highlightCanvas.getContext('2d')!.getImageData(0, 0, 1, 1).data
    expect(shadow[2]).toBeGreaterThan(shadow[0])
    expect(highlight[0]).toBeGreaterThan(highlight[2])
  })

  it('exposes all filter names in FILTERS', () => {
    expect(FILTERS).toContain('none')
    expect(FILTERS).toContain('warmFilm')
    expect(FILTERS).toEqual([
      'none',
      'warmFilm',
      'coolFilm',
      'vintagePositive',
      'monochrome',
      'softFade',
      'vivid',
      'tealOrange',
    ])
  })
})

describe('createFilterThumbnail', () => {
  it('returns a canvas sized to the requested thumbnail size', () => {
    const photo = createTestPhoto(200, 100)
    const thumbnail = createFilterThumbnail(photo, 'none', 64)
    expect(thumbnail.width).toBe(64)
    expect(thumbnail.height).toBe(64)
  })

  it('applies the requested filter to the thumbnail pixels', () => {
    const photo = createTestPhoto(200, 100)
    const thumbnail = createFilterThumbnail(photo, 'warmFilm', 64)
    const ctx = thumbnail.getContext('2d')!
    const pixel = ctx.getImageData(32, 32, 1, 1).data
    // createTestPhoto 填充的是纯色 #888888（136,136,136），暖调滤镜应提升红色通道
    expect(pixel[0]).toBeGreaterThan(136)
  })
})
