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

  it('exposes all filter names in FILTERS', () => {
    expect(FILTERS).toContain('none')
    expect(FILTERS).toContain('warmFilm')
    expect(FILTERS.length).toBeGreaterThanOrEqual(2)
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
