import { describe, it, expect, vi } from 'vitest'
import { createTestPhoto } from '../../tests/testImage'
import { renderSplitGrid, renderCollageGrid } from './gridRenderer'

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

describe('renderSplitGrid', () => {
  it('draws onto a canvas sized to include the gap', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(140, 110)
    const ctx = canvas.getContext('2d')!

    expect(() => renderSplitGrid(ctx, { photo, rows: 3, cols: 3, gapPx: 10 })).not.toThrow()
  })

  it('strokes grid separator lines when showGridLines is true', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(120, 90)
    const ctx = canvas.getContext('2d')!
    const strokeSpy = vi.spyOn(ctx, 'stroke')

    renderSplitGrid(ctx, { photo, rows: 3, cols: 3, gapPx: 0, showGridLines: true })

    expect(strokeSpy).toHaveBeenCalled()
  })

  it('does not stroke grid separator lines by default (export mode)', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(120, 90)
    const ctx = canvas.getContext('2d')!
    const strokeSpy = vi.spyOn(ctx, 'stroke')

    renderSplitGrid(ctx, { photo, rows: 3, cols: 3, gapPx: 0 })

    expect(strokeSpy).not.toHaveBeenCalled()
  })

  it('uses the configured grid border style when provided', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(120, 90)
    const ctx = canvas.getContext('2d')!
    const lineDashSpy = vi.spyOn(ctx, 'setLineDash')
    const strokeSpy = vi.spyOn(ctx, 'stroke')

    renderSplitGrid(ctx, {
      photo,
      rows: 3,
      cols: 3,
      gapPx: 0,
      gridBorder: { color: '#ff5500', widthPx: 2, style: 'dashed' },
    })

    expect(lineDashSpy).toHaveBeenCalledWith([12, 8])
    expect(strokeSpy).toHaveBeenCalled()
  })

  it('skips grid borders when the style is none', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(120, 90)
    const ctx = canvas.getContext('2d')!
    const strokeSpy = vi.spyOn(ctx, 'stroke')

    renderSplitGrid(ctx, {
      photo,
      rows: 3,
      cols: 3,
      gapPx: 0,
      showGridLines: true,
      gridBorder: { color: '#ff5500', widthPx: 2, style: 'none' },
    })

    expect(strokeSpy).not.toHaveBeenCalled()
  })

  it('uses the configured background color and opacity', () => {
    const photo = createTestPhoto(120, 90)
    const canvas = makeCanvas(140, 110)
    const ctx = canvas.getContext('2d')!
    let fillStyle = ''
    let globalAlpha = 0
    vi.spyOn(ctx, 'fillRect').mockImplementation(() => {
      fillStyle = String(ctx.fillStyle)
      globalAlpha = ctx.globalAlpha
    })

    renderSplitGrid(ctx, {
      photo,
      rows: 3,
      cols: 3,
      gapPx: 10,
      gridBackground: { color: '#336699', opacity: 0.35 },
    })

    expect(fillStyle).toBe('#336699')
    expect(globalAlpha).toBeCloseTo(0.35)
  })
})

describe('renderCollageGrid', () => {
  it('draws each photo into its assigned cell without throwing', () => {
    const photos = [createTestPhoto(80, 120), createTestPhoto(120, 80), createTestPhoto(100, 100)]
    const canvas = makeCanvas(210, 100)
    const ctx = canvas.getContext('2d')!

    expect(() =>
      renderCollageGrid(ctx, { photos, rows: 1, cols: 4, cellWidth: 50, cellHeight: 100, gapPx: 10 })
    ).not.toThrow()
  })

  it('fills empty cells with the surface-container placeholder color', () => {
    const photos = [createTestPhoto(50, 50)]
    const canvas = makeCanvas(100, 50)
    const ctx = canvas.getContext('2d')!
    const fillRectSpy = vi.spyOn(ctx, 'fillRect')

    renderCollageGrid(ctx, { photos, rows: 1, cols: 2, cellWidth: 50, cellHeight: 50, gapPx: 0 })

    expect(fillRectSpy).toHaveBeenCalledWith(50, 0, 50, 50)
  })

  it('offsets collage cells by the configured padding', () => {
    const photos = [createTestPhoto(50, 50)]
    const canvas = makeCanvas(70, 70)
    const ctx = canvas.getContext('2d')!
    const drawImageSpy = vi.spyOn(ctx, 'drawImage')

    renderCollageGrid(ctx, {
      photos,
      rows: 1,
      cols: 1,
      cellWidth: 50,
      cellHeight: 50,
      gapPx: 0,
      paddingPx: 10,
    })

    expect(drawImageSpy.mock.calls[0].slice(-4)).toEqual([10, 10, 50, 50])
  })
})
