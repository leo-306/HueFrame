import { describe, it, expect } from 'vitest'
import { GRID_PRESETS, clampGridSize, computeSplitCells, computeSplitCanvasSize } from './gridLayout'

describe('GRID_PRESETS', () => {
  it('exposes the three preset grid specs', () => {
    expect(GRID_PRESETS).toEqual([
      { id: '3x3', rows: 3, cols: 3, label: '3×3' },
      { id: '2x2', rows: 2, cols: 2, label: '2×2' },
      { id: '1x3', rows: 1, cols: 3, label: '1×3' },
    ])
  })
})

describe('clampGridSize', () => {
  it('leaves values within 1-6 unchanged', () => {
    expect(clampGridSize(4)).toBe(4)
  })

  it('clamps values below 1 up to 1', () => {
    expect(clampGridSize(0)).toBe(1)
  })

  it('clamps values above 6 down to 6', () => {
    expect(clampGridSize(9)).toBe(6)
  })
})

describe('computeSplitCells', () => {
  it('divides a 1200x900 image into a 3x3 grid of 400x300 cells with no gap', () => {
    const cells = computeSplitCells({ imageWidth: 1200, imageHeight: 900, rows: 3, cols: 3, gapPx: 0 })
    expect(cells).toHaveLength(9)
    expect(cells[0]).toEqual({ sx: 0, sy: 0, sWidth: 400, sHeight: 300, dx: 0, dy: 0, dWidth: 400, dHeight: 300 })
    expect(cells[2]).toEqual({ sx: 800, sy: 0, sWidth: 400, sHeight: 300, dx: 800, dy: 0, dWidth: 400, dHeight: 300 })
    expect(cells[8]).toEqual({ sx: 800, sy: 600, sWidth: 400, sHeight: 300, dx: 800, dy: 600, dWidth: 400, dHeight: 300 })
  })

  it('offsets destination coordinates by gapPx between cells', () => {
    const cells = computeSplitCells({ imageWidth: 100, imageHeight: 100, rows: 1, cols: 2, gapPx: 10 })
    expect(cells[0]).toEqual({ sx: 0, sy: 0, sWidth: 50, sHeight: 100, dx: 0, dy: 0, dWidth: 50, dHeight: 100 })
    expect(cells[1]).toEqual({ sx: 50, sy: 0, sWidth: 50, sHeight: 100, dx: 60, dy: 0, dWidth: 50, dHeight: 100 })
  })

  it('handles a 1x1 grid as the whole image', () => {
    const cells = computeSplitCells({ imageWidth: 300, imageHeight: 200, rows: 1, cols: 1, gapPx: 0 })
    expect(cells).toEqual([{ sx: 0, sy: 0, sWidth: 300, sHeight: 200, dx: 0, dy: 0, dWidth: 300, dHeight: 200 }])
  })

  it('handles non-divisible dimensions without gaps or overlaps between cells', () => {
    const cells = computeSplitCells({ imageWidth: 100, imageHeight: 100, rows: 1, cols: 3, gapPx: 0 })
    expect(cells[0].sWidth + cells[1].sWidth + cells[2].sWidth).toBe(100)
    expect(cells[0].sx).toBe(0)
    expect(cells[2].sx + cells[2].sWidth).toBe(100)
  })
})

describe('computeSplitCanvasSize', () => {
  it('computes the total output canvas size including gaps', () => {
    expect(computeSplitCanvasSize({ imageWidth: 1200, imageHeight: 900, rows: 3, cols: 3, gapPx: 10 })).toEqual({
      width: 1200 + 10 * 2,
      height: 900 + 10 * 2,
    })
  })

  it('returns the original size when gapPx is 0', () => {
    expect(computeSplitCanvasSize({ imageWidth: 300, imageHeight: 200, rows: 2, cols: 2, gapPx: 0 })).toEqual({
      width: 300,
      height: 200,
    })
  })
})
