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

export interface CollageCell {
  imageIndex: number | null
  dx: number
  dy: number
}

interface CollageInput {
  imageCount: number
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  gapPx: number
}

/**
 * 拼图模式：按上传顺序从左到右、从上到下填入网格。
 * 图片数少于格子数时，多余格子的 imageIndex 为 null（占位色块）；
 * 图片数多于格子数时，只取前 rows*cols 张。
 */
export function computeCollageCells({ imageCount, rows, cols, cellWidth, cellHeight, gapPx }: CollageInput): CollageCell[] {
  const totalCells = rows * cols
  const cells: CollageCell[] = []
  for (let i = 0; i < totalCells; i++) {
    const row = Math.floor(i / cols)
    const col = i % cols
    cells.push({
      imageIndex: i < imageCount ? i : null,
      dx: col * (cellWidth + gapPx),
      dy: row * (cellHeight + gapPx),
    })
  }
  return cells
}

interface CoverInput {
  imageWidth: number
  imageHeight: number
  cellWidth: number
  cellHeight: number
}

export interface SourceRect {
  sx: number
  sy: number
  sWidth: number
  sHeight: number
}

/**
 * cover 裁剪：算出源图里应该取的矩形区域，使得该区域的宽高比等于单元格宽高比，
 * 居中裁剪（多出来的部分左右或上下对称裁掉）。
 */
export function computeCoverSourceRect({ imageWidth, imageHeight, cellWidth, cellHeight }: CoverInput): SourceRect {
  const imageRatio = imageWidth / imageHeight
  const cellRatio = cellWidth / cellHeight

  if (imageRatio > cellRatio) {
    const sWidth = imageHeight * cellRatio
    return { sx: (imageWidth - sWidth) / 2, sy: 0, sWidth, sHeight: imageHeight }
  }

  if (imageRatio < cellRatio) {
    const sHeight = imageWidth / cellRatio
    return { sx: 0, sy: (imageHeight - sHeight) / 2, sWidth: imageWidth, sHeight }
  }

  return { sx: 0, sy: 0, sWidth: imageWidth, sHeight: imageHeight }
}

interface CollageCanvasInput {
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  gapPx: number
}

export function computeCollageCanvasSize({
  rows,
  cols,
  cellWidth,
  cellHeight,
  gapPx,
}: CollageCanvasInput): { width: number; height: number } {
  return {
    width: cellWidth * cols + gapPx * (cols - 1),
    height: cellHeight * rows + gapPx * (rows - 1),
  }
}
