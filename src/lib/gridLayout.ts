export interface GridPreset {
  id: string
  rows: number
  cols: number
  label: string
}

export const GRID_PRESETS: GridPreset[] = [
  { id: '3x3', rows: 3, cols: 3, label: '3×3' },
  { id: '2x2', rows: 2, cols: 2, label: '2×2' },
  { id: '2x3', rows: 2, cols: 3, label: '2×3' },
  { id: '3x2', rows: 3, cols: 2, label: '3×2' },
  { id: '1x3', rows: 1, cols: 3, label: '1×3' },
  { id: '3x1', rows: 3, cols: 1, label: '3×1' },
]

const MIN_GRID_SIZE = 1
const MAX_GRID_SIZE = 10

/**
 * 自定义行列输入的合法范围是 1-10，超出范围钳制到边界值。
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
  paddingPx?: number
}

export function computeCollageCanvasSize({
  rows,
  cols,
  cellWidth,
  cellHeight,
  gapPx,
  paddingPx = 0,
}: CollageCanvasInput): { width: number; height: number } {
  return {
    width: cellWidth * cols + gapPx * (cols - 1) + paddingPx * 2,
    height: cellHeight * rows + gapPx * (rows - 1) + paddingPx * 2,
  }
}

// ─── 旋转切分布局 ───────────────────────────────────────────────────────────

export interface RotatedLayoutCell {
  sx: number
  sy: number
  sWidth: number
  sHeight: number
  /** 在导出画布上的中心点坐标（已含间距偏移），直接传给 ctx.translate */
  centerX: number
  centerY: number
  /** 弧度，供 ctx.rotate() 直接使用 */
  rotation: number
  allocWidth: number
  allocHeight: number
  row: number
  col: number
}

export interface RotatedSplitLayout {
  colWidths: number[]
  rowHeights: number[]
  canvasWidth: number
  canvasHeight: number
  cells: RotatedLayoutCell[]
}

/** 旋转 angleDeg 度后的外接矩形尺寸 */
export function computeRotatedBoundingBox(
  cw: number,
  ch: number,
  angleDeg: number
): { bw: number; bh: number } {
  const rad = (angleDeg * Math.PI) / 180
  const cosA = Math.abs(Math.cos(rad))
  const sinA = Math.abs(Math.sin(rad))
  return { bw: cw * cosA + ch * sinA, bh: cw * sinA + ch * cosA }
}

/**
 * 带旋转的切分布局：
 * - 每个格子在 rotationsDeg 里有一个旋转角度（度数）
 * - 每列宽度 = 该列所有旋转后外接框宽度的最大值（防止内容被裁）
 * - 每行高度同理
 * - gapXPx / gapYPx 分别控制横向 / 纵向间距
 */
export function computeRotatedSplitLayout({
  imageWidth,
  imageHeight,
  rows,
  cols,
  gapXPx,
  gapYPx,
  paddingPx = 0,
  rotationsDeg,
}: {
  imageWidth: number
  imageHeight: number
  rows: number
  cols: number
  gapXPx: number
  gapYPx: number
  paddingPx?: number
  rotationsDeg: number[]
}): RotatedSplitLayout {
  const colBoundaries = axisBoundaries(imageWidth, cols)
  const rowBoundaries = axisBoundaries(imageHeight, rows)

  const srcColWidths = Array.from({ length: cols }, (_, j) => colBoundaries[j + 1] - colBoundaries[j])
  const srcRowHeights = Array.from({ length: rows }, (_, i) => rowBoundaries[i + 1] - rowBoundaries[i])

  // 每格旋转后的外接框
  const bboxes = srcRowHeights.flatMap((ch, i) =>
    srcColWidths.map((cw, j) => computeRotatedBoundingBox(cw, ch, rotationsDeg[i * cols + j] ?? 0))
  )

  // 分配给每列的宽度：该列所有格子 bw 的最大值（向上取整）
  const colWidths = Array.from({ length: cols }, (_, j) => {
    let max = 0
    for (let i = 0; i < rows; i++) max = Math.max(max, bboxes[i * cols + j].bw)
    return Math.ceil(max)
  })

  // 分配给每行的高度：该行所有格子 bh 的最大值
  const rowHeights = Array.from({ length: rows }, (_, i) => {
    let max = 0
    for (let j = 0; j < cols; j++) max = Math.max(max, bboxes[i * cols + j].bh)
    return Math.ceil(max)
  })

  const canvasWidth = colWidths.reduce((s, w) => s + w, 0) + gapXPx * (cols - 1) + paddingPx * 2
  const canvasHeight = rowHeights.reduce((s, h) => s + h, 0) + gapYPx * (rows - 1) + paddingPx * 2

  // 每列 / 每行的起始坐标
  const colStarts = colWidths.map((_, j) =>
    paddingPx + colWidths.slice(0, j).reduce((s, w) => s + w, 0) + gapXPx * j
  )
  const rowStarts = rowHeights.map((_, i) =>
    paddingPx + rowHeights.slice(0, i).reduce((s, h) => s + h, 0) + gapYPx * i
  )

  const cells: RotatedLayoutCell[] = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const idx = i * cols + j
      cells.push({
        sx: colBoundaries[j],
        sy: rowBoundaries[i],
        sWidth: srcColWidths[j],
        sHeight: srcRowHeights[i],
        centerX: colStarts[j] + colWidths[j] / 2,
        centerY: rowStarts[i] + rowHeights[i] / 2,
        rotation: ((rotationsDeg[idx] ?? 0) * Math.PI) / 180,
        allocWidth: colWidths[j],
        allocHeight: rowHeights[i],
        row: i,
        col: j,
      })
    }
  }

  return { colWidths, rowHeights, canvasWidth, canvasHeight, cells }
}
