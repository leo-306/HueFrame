import {
  computeSplitCells,
  computeSplitCanvasSize,
  computeCollageCells,
  computeCoverSourceRect,
  type RotatedSplitLayout,
} from './gridLayout'

const PLACEHOLDER_COLOR = '#eeeeed' // --color-surface-container
const GAP_BACKGROUND = '#f9f9f8' // --color-surface

interface SplitRenderInput {
  photo: HTMLImageElement
  rows: number
  cols: number
  gapPx: number
  /**
   * 预览态传 true，在每个切分块周围描一圈细线，方便用户判断切分位置；
   * 导出态（默认 false）不画线，只用 gapPx 的背景色间距分隔——
   * 保证导出的图片是纯净的网格大图，不含辅助线。
   */
  showGridLines?: boolean
}

const GRID_LINE_COLOR = 'rgba(26, 28, 28, 0.15)' // 半透明的 --color-on-surface，仅用于预览辅助线

/**
 * 切分模式：把原图按行列切开，各块之间留 gapPx 的背景色间距，绘制到目标 canvas。
 * 调用方需要预先把 canvas 尺寸设置为 computeSplitCanvasSize 的返回值。
 */
export function renderSplitGrid(
  ctx: CanvasRenderingContext2D,
  { photo, rows, cols, gapPx, showGridLines = false }: SplitRenderInput
): void {
  const imageWidth = photo.naturalWidth || photo.width
  const imageHeight = photo.naturalHeight || photo.height
  const { width, height } = computeSplitCanvasSize({ imageWidth, imageHeight, rows, cols, gapPx })

  if (gapPx > 0) {
    ctx.fillStyle = GAP_BACKGROUND
    ctx.fillRect(0, 0, width, height)
  }

  const cells = computeSplitCells({ imageWidth, imageHeight, rows, cols, gapPx })
  for (const cell of cells) {
    ctx.drawImage(photo, cell.sx, cell.sy, cell.sWidth, cell.sHeight, cell.dx, cell.dy, cell.dWidth, cell.dHeight)
  }

  if (showGridLines) {
    ctx.strokeStyle = GRID_LINE_COLOR
    ctx.lineWidth = 1
    for (const cell of cells) {
      ctx.beginPath()
      ctx.rect(cell.dx, cell.dy, cell.dWidth, cell.dHeight)
      ctx.stroke()
    }
  }
}

interface CollageRenderInput {
  photos: HTMLImageElement[]
  rows: number
  cols: number
  cellWidth: number
  cellHeight: number
  gapPx: number
}

/**
 * 拼图模式：按上传顺序把每张图 cover 裁剪填入对应格子，多余格子画占位色块。
 * 调用方需要预先把 canvas 尺寸设置为 computeCollageCanvasSize 的返回值。
 */
export function renderCollageGrid(
  ctx: CanvasRenderingContext2D,
  { photos, rows, cols, cellWidth, cellHeight, gapPx }: CollageRenderInput
): void {
  const cells = computeCollageCells({ imageCount: photos.length, rows, cols, cellWidth, cellHeight, gapPx })

  for (const cell of cells) {
    if (cell.imageIndex === null) {
      ctx.fillStyle = PLACEHOLDER_COLOR
      ctx.fillRect(cell.dx, cell.dy, cellWidth, cellHeight)
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
      cell.dx,
      cell.dy,
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
}

/**
 * 旋转切分模式：每格按各自旋转角绘制，外接框区域用背景色填充，不裁剪内容。
 * 调用方须预先将 canvas 尺寸设为 layout.canvasWidth × layout.canvasHeight。
 * 选中格子的高亮边框由调用方在 DOM 层用绝对定位元素绘制（避免被容器的圆角裁剪）。
 */
export function renderRotatedSplitGrid(
  ctx: CanvasRenderingContext2D,
  { photo, layout, showGridLines = false }: RotatedSplitRenderInput
): void {
  ctx.fillStyle = GAP_BACKGROUND
  ctx.fillRect(0, 0, layout.canvasWidth, layout.canvasHeight)

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

  if (showGridLines) {
    ctx.strokeStyle = GRID_LINE_COLOR
    ctx.lineWidth = 1
    for (const cell of layout.cells) {
      ctx.save()
      ctx.translate(cell.centerX, cell.centerY)
      ctx.rotate(cell.rotation)
      ctx.beginPath()
      ctx.rect(-cell.sWidth / 2, -cell.sHeight / 2, cell.sWidth, cell.sHeight)
      ctx.stroke()
      ctx.restore()
    }
  }
}
