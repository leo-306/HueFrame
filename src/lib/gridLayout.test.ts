import { describe, it, expect } from 'vitest'
import {
  GRID_PRESETS,
  clampGridSize,
  computeSplitCells,
  computeSplitCanvasSize,
  computeCollageCells,
  computeCoverSourceRect,
  computeCollageCanvasSize,
  computeRotatedSplitLayout,
  scaleGridSpacing,
} from './gridLayout'

describe('GRID_PRESETS', () => {
  it('exposes the common preset grid specs', () => {
    expect(GRID_PRESETS).toEqual([
      { id: '3x3', rows: 3, cols: 3, label: '3×3' },
      { id: '2x2', rows: 2, cols: 2, label: '2×2' },
      { id: '2x3', rows: 2, cols: 3, label: '2×3' },
      { id: '3x2', rows: 3, cols: 2, label: '3×2' },
      { id: '1x3', rows: 1, cols: 3, label: '1×3' },
      { id: '3x1', rows: 3, cols: 1, label: '3×1' },
    ])
  })
})

describe('clampGridSize', () => {
  it('leaves values within 1-10 unchanged', () => {
    expect(clampGridSize(4)).toBe(4)
  })

  it('clamps values below 1 up to 1', () => {
    expect(clampGridSize(0)).toBe(1)
  })

  it('clamps values above 10 down to 10', () => {
    expect(clampGridSize(11)).toBe(10)
  })
})

describe('scaleGridSpacing', () => {
  it('keeps values unchanged at the 800px logical width', () => {
    expect(scaleGridSpacing(8, 800)).toBe(8)
  })

  it('scales values to the actual canvas content width', () => {
    expect(scaleGridSpacing(8, 4000)).toBe(40)
    expect(scaleGridSpacing(8, 400)).toBe(4)
  })

  it('keeps zero spacing at zero', () => {
    expect(scaleGridSpacing(0, 4000)).toBe(0)
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

describe('computeCollageCells', () => {
  it('assigns images to cells in upload order, left-to-right then top-to-bottom', () => {
    const cells = computeCollageCells({
      imageCount: 4,
      rows: 2,
      cols: 2,
      cellWidth: 100,
      cellHeight: 100,
      gapPx: 0,
    })
    expect(cells).toHaveLength(4)
    expect(cells.map((c) => c.imageIndex)).toEqual([0, 1, 2, 3])
    expect(cells[0]).toMatchObject({ dx: 0, dy: 0 })
    expect(cells[1]).toMatchObject({ dx: 100, dy: 0 })
    expect(cells[2]).toMatchObject({ dx: 0, dy: 100 })
    expect(cells[3]).toMatchObject({ dx: 100, dy: 100 })
  })

  it('marks extra empty cells as placeholders when imageCount < total cells', () => {
    const cells = computeCollageCells({
      imageCount: 2,
      rows: 2,
      cols: 2,
      cellWidth: 100,
      cellHeight: 100,
      gapPx: 0,
    })
    expect(cells[0].imageIndex).toBe(0)
    expect(cells[1].imageIndex).toBe(1)
    expect(cells[2].imageIndex).toBeNull()
    expect(cells[3].imageIndex).toBeNull()
  })

  it('only uses the first N images when imageCount > total cells', () => {
    const cells = computeCollageCells({
      imageCount: 6,
      rows: 2,
      cols: 2,
      cellWidth: 100,
      cellHeight: 100,
      gapPx: 0,
    })
    expect(cells).toHaveLength(4)
    expect(cells.map((c) => c.imageIndex)).toEqual([0, 1, 2, 3])
  })

  it('offsets destination coordinates by gapPx', () => {
    const cells = computeCollageCells({
      imageCount: 2,
      rows: 1,
      cols: 2,
      cellWidth: 50,
      cellHeight: 50,
      gapPx: 8,
    })
    expect(cells[0]).toMatchObject({ dx: 0, dy: 0 })
    expect(cells[1]).toMatchObject({ dx: 58, dy: 0 })
  })
})

describe('computeCoverSourceRect', () => {
  it('crops a wider-than-cell image symmetrically on the left and right', () => {
    const rect = computeCoverSourceRect({ imageWidth: 400, imageHeight: 100, cellWidth: 100, cellHeight: 100 })
    expect(rect).toEqual({ sx: 150, sy: 0, sWidth: 100, sHeight: 100 })
  })

  it('crops a taller-than-cell image symmetrically on the top and bottom', () => {
    const rect = computeCoverSourceRect({ imageWidth: 100, imageHeight: 400, cellWidth: 100, cellHeight: 100 })
    expect(rect).toEqual({ sx: 0, sy: 150, sWidth: 100, sHeight: 100 })
  })

  it('uses the whole image when its aspect ratio already matches the cell', () => {
    const rect = computeCoverSourceRect({ imageWidth: 200, imageHeight: 100, cellWidth: 100, cellHeight: 50 })
    expect(rect).toEqual({ sx: 0, sy: 0, sWidth: 200, sHeight: 100 })
  })
})

describe('computeCollageCanvasSize', () => {
  it('computes total canvas size from cell size, grid size, and gap', () => {
    expect(computeCollageCanvasSize({ rows: 2, cols: 3, cellWidth: 100, cellHeight: 80, gapPx: 10 })).toEqual({
      width: 100 * 3 + 10 * 2,
      height: 80 * 2 + 10 * 1,
    })
  })

  it('adds equal padding around the collage', () => {
    expect(
      computeCollageCanvasSize({ rows: 2, cols: 2, cellWidth: 100, cellHeight: 80, gapPx: 10, paddingPx: 20 })
    ).toEqual({ width: 250, height: 210 })
  })
})

describe('computeRotatedSplitLayout padding', () => {
  it('expands the canvas and offsets cell centers by the configured padding', () => {
    const layout = computeRotatedSplitLayout({
      imageWidth: 100,
      imageHeight: 100,
      rows: 1,
      cols: 1,
      gapXPx: 0,
      gapYPx: 0,
      paddingPx: 12,
      rotationsDeg: [0],
    })

    expect(layout.canvasWidth).toBe(124)
    expect(layout.canvasHeight).toBe(124)
    expect(layout.cells[0]).toMatchObject({ centerX: 62, centerY: 62 })
  })
})
