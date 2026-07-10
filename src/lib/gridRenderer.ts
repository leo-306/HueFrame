import {
  computeSplitCells,
  computeSplitCanvasSize,
  computeCollageCells,
  computeCoverSourceRect,
  type RotatedSplitLayout,
} from './gridLayout'

const PLACEHOLDER_COLOR = '#eeeeed' // --color-surface-container
const GAP_BACKGROUND = '#f9f9f8' // --color-surface
const GRID_LINE_COLOR = '#d8d8d7'

export interface GridBackground {
  color: string
  opacity: number
}

export type GridCellBorderStyle = 'none' | 'solid' | 'dashed' | 'dotted'

export interface GridCellBorder {
  color: string
  widthPx: number
  style: GridCellBorderStyle
}

const DEFAULT_GRID_BORDER: GridCellBorder = {
  color: GRID_LINE_COLOR,
  widthPx: 1,
  style: 'solid',
}

const DEFAULT_GRID_BACKGROUND: GridBackground = {
  color: GAP_BACKGROUND,
  opacity: 1,
}

interface SplitRenderInput {
  photo: HTMLImageElement
  rows: number
  cols: number
  gapPx: number
  /**
   * 预览态传 true，在每个切分块周围描一圈细线，方便用户判断切分位置；
   * 默认 false 时不画线，只用 gapPx 的背景色间距分隔。
   */
  showGridLines?: boolean
  gridBorder?: GridCellBorder
  gridBackground?: GridBackground
}

/**
 * 切分模式：把原图按行列切开，各块之间留 gapPx 的背景色间距，绘制到目标 canvas。
 * 调用方需要预先把 canvas 尺寸设置为 computeSplitCanvasSize 的返回值。
 */
export function renderSplitGrid(
  ctx: CanvasRenderingContext2D,
  { photo, rows, cols, gapPx, showGridLines = false, gridBorder, gridBackground }: SplitRenderInput
): void {
  const imageWidth = photo.naturalWidth || photo.width
  const imageHeight = photo.naturalHeight || photo.height
  const { width, height } = computeSplitCanvasSize({ imageWidth, imageHeight, rows, cols, gapPx })

  fillGridBackground(ctx, width, height, gridBackground)

  const cells = computeSplitCells({ imageWidth, imageHeight, rows, cols, gapPx })
  for (const cell of cells) {
    ctx.drawImage(photo, cell.sx, cell.sy, cell.sWidth, cell.sHeight, cell.dx, cell.dy, cell.dWidth, cell.dHeight)
  }

  const border = resolveGridBorder(showGridLines, gridBorder)
  if (border) {
    applyGridBorderStyle(ctx, border)
    for (const cell of cells) {
      ctx.beginPath()
      ctx.rect(cell.dx, cell.dy, cell.dWidth, cell.dHeight)
      ctx.stroke()
    }
    ctx.restore()
  }
}

interface CollageRenderInput {
  photos: HTMLImageElement[]
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  gapPx: number
  paddingPx?: number
}

/**
 * 拼图模式：按上传顺序把每张图 cover 裁剪填入对应格子，多余格子画占位色块。
 * 调用方需要预先把 canvas 尺寸设置为 computeCollageCanvasSize 的返回值。
 */
export function renderCollageGrid(
  ctx: CanvasRenderingContext2D,
  { photos, rows, cols, cellWidth, cellHeight, gapPx, paddingPx = 0 }: CollageRenderInput
): void {
  const cells = computeCollageCells({ imageCount: photos.length, rows, cols, cellWidth, cellHeight, gapPx })

  if (paddingPx > 0) {
    ctx.fillStyle = GAP_BACKGROUND
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  for (const cell of cells) {
    const dx = cell.dx + paddingPx
    const dy = cell.dy + paddingPx
    if (cell.imageIndex === null) {
      ctx.fillStyle = PLACEHOLDER_COLOR
      ctx.fillRect(dx, dy, cellWidth, cellHeight)
      continue
    }

    const photo = photos[cell.imageIndex]
    const imageWidth = photo.naturalWidth || photo.width
    const imageHeight = photo.naturalHeight || photo.height
    const source = computeCoverSourceRect({ imageWidth, imageHeight, cellWidth, cellHeight })
    ctx.drawImage(
      photo,
      source.sx,
      source.sy,
      source.sWidth,
      source.sHeight,
      dx,
      dy,
      cellWidth,
      cellHeight
    )
  }
}

// ─── 旋转切分渲染 ────────────────────────────────────────────────────────────

interface RotatedSplitRenderInput {
  photo: HTMLImageElement
  layout: RotatedSplitLayout
  showGridLines?: boolean
  gridBorder?: GridCellBorder
  gridBackground?: GridBackground
}

/**
 * 旋转切分模式：每格按各自旋转角绘制，外接框区域用背景色填充，不裁剪内容。
 * 调用方须预先将 canvas 尺寸设为 layout.canvasWidth × layout.canvasHeight。
 * 选中格子的高亮边框由调用方在 DOM 层用绝对定位元素绘制（避免被容器的圆角裁剪）。
 */
export function renderRotatedSplitGrid(
  ctx: CanvasRenderingContext2D,
  { photo, layout, showGridLines = false, gridBorder, gridBackground }: RotatedSplitRenderInput
): void {
  fillGridBackground(ctx, layout.canvasWidth, layout.canvasHeight, gridBackground)

  for (const cell of layout.cells) {
    ctx.save()
    ctx.translate(cell.centerX, cell.centerY)
    ctx.rotate(cell.rotation)
    ctx.drawImage(
      photo,
      cell.sx, cell.sy, cell.sWidth, cell.sHeight,
      -cell.sWidth / 2, -cell.sHeight / 2, cell.sWidth, cell.sHeight
    )
    ctx.restore()
  }

  const border = resolveGridBorder(showGridLines, gridBorder)
  if (border) {
    applyGridBorderStyle(ctx, border)
    for (const cell of layout.cells) {
      ctx.save()
      ctx.translate(cell.centerX, cell.centerY)
      ctx.rotate(cell.rotation)
      ctx.beginPath()
      ctx.rect(-cell.sWidth / 2, -cell.sHeight / 2, cell.sWidth, cell.sHeight)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }
}

function fillGridBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background = DEFAULT_GRID_BACKGROUND
): void {
  ctx.clearRect(0, 0, width, height)
  const opacity = Math.min(1, Math.max(0, background.opacity))
  if (opacity === 0) return

  ctx.save()
  ctx.fillStyle = background.color
  ctx.globalAlpha = opacity
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

function resolveGridBorder(showGridLines: boolean, gridBorder?: GridCellBorder): GridCellBorder | null {
  const border = gridBorder ?? (showGridLines ? DEFAULT_GRID_BORDER : null)
  if (!border || border.style === 'none' || border.widthPx <= 0) return null
  return border
}

function applyGridBorderStyle(ctx: CanvasRenderingContext2D, border: GridCellBorder): void {
  ctx.save()
  ctx.strokeStyle = border.color
  ctx.lineWidth = border.widthPx
  ctx.lineCap = border.style === 'dotted' ? 'round' : 'butt'

  if (border.style === 'dashed') {
    ctx.setLineDash([border.widthPx * 6, border.widthPx * 4])
  } else if (border.style === 'dotted') {
    ctx.setLineDash([0, border.widthPx * 2.5])
  } else {
    ctx.setLineDash([])
  }
}
