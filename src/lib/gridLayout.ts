export interface GridPreset {
  id: string
  rows: number
  cols: number
  label: string
}

export const GRID_PRESETS: GridPreset[] = [
  { id: '3x3', rows: 3, cols: 3, label: '3×3' },
  { id: '2x2', rows: 2, cols: 2, label: '2×2' },
  { id: '1x3', rows: 1, cols: 3, label: '1×3' },
]

const MIN_GRID_SIZE = 1
const MAX_GRID_SIZE = 6

/**
 * 自定义行列输入的合法范围是 1-6，超出范围钳制到边界值。
 */
export function clampGridSize(value: number): number {
  return Math.min(MAX_GRID_SIZE, Math.max(MIN_GRID_SIZE, value))
}

export interface CellRect {
  sx: number
  sy: number
  sWidth: number
  sHeight: number
  dx: number
  dy: number
  dWidth: number
  dHeight: number
}

interface SplitInput {
  imageWidth: number
  imageHeight: number
  rows: number
  cols: number
  gapPx: number
}

/**
 * 单图切分：直接按行列对原图坐标等分切割，不裁剪、不改变整图比例。
 * 非整除的情况下，最后一行/列吸收余数像素，保证所有块拼起来正好等于原图尺寸。
 */
export function computeSplitCells({ imageWidth, imageHeight, rows, cols, gapPx }: SplitInput): CellRect[] {
  const cells: CellRect[] = []
  const colBoundaries = axisBoundaries(imageWidth, cols)
  const rowBoundaries = axisBoundaries(imageHeight, rows)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const sx = colBoundaries[col]
      const sWidth = colBoundaries[col + 1] - colBoundaries[col]
      const sy = rowBoundaries[row]
      const sHeight = rowBoundaries[row + 1] - rowBoundaries[row]
      cells.push({
        sx,
        sy,
        sWidth,
        sHeight,
        dx: sx + col * gapPx,
        dy: sy + row * gapPx,
        dWidth: sWidth,
        dHeight: sHeight,
      })
    }
  }
  return cells
}

/**
 * 把 [0, size] 区间按 count 等分，返回 count+1 个边界值（含首尾）。
 * 用 Math.round 保证边界是整数像素，且最后一个边界恒等于 size（吸收舍入误差）。
 */
function axisBoundaries(size: number, count: number): number[] {
  const boundaries: number[] = []
  for (let i = 0; i <= count; i++) {
    boundaries.push(i === count ? size : Math.round((size / count) * i))
  }
  return boundaries
}

/**
 * 切分模式导出大图的总尺寸 = 原图尺寸 + 内部间距。
 */
export function computeSplitCanvasSize({
  imageWidth,
  imageHeight,
  rows,
  cols,
  gapPx,
}: SplitInput): { width: number; height: number } {
  return {
    width: imageWidth + gapPx * (cols - 1),
    height: imageHeight + gapPx * (rows - 1),
  }
}
