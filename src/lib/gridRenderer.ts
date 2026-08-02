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

export type CollageTemplateId =
  | 'clean'
  | 'focus'
  | 'film'
  | 'scrapbook'
  | 'plog'
  | 'magazine'
  | 'colorStory'
  | 'cinematic'

export const FIXED_COLLAGE_TEMPLATE_CAPACITY: Partial<Record<CollageTemplateId, number>> = {
  plog: 9,
  magazine: 7,
  colorStory: 6,
  cinematic: 5,
}

export function isFixedCollageTemplate(templateId: CollageTemplateId): boolean {
  return templateId in FIXED_COLLAGE_TEMPLATE_CAPACITY
}

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
  templateId?: CollageTemplateId
}

/**
 * 拼图模式：按上传顺序把每张图 cover 裁剪填入对应格子，多余格子画占位色块。
 * 调用方需要预先把 canvas 尺寸设置为 computeCollageCanvasSize 的返回值。
 */
export function renderCollageGrid(
  ctx: CanvasRenderingContext2D,
  { photos, rows, cols, cellWidth, cellHeight, gapPx, paddingPx = 0, templateId = 'clean' }: CollageRenderInput
): void {
  if (isFixedCollageTemplate(templateId)) {
    renderFixedCollage(ctx, photos, templateId, gapPx, paddingPx)
    return
  }

  const cells = computeCollageCells({ imageCount: photos.length, rows, cols, cellWidth, cellHeight, gapPx })

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (paddingPx > 0 || templateId !== 'clean') {
    ctx.fillStyle = collageBackground(templateId)
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  cells.forEach((cell, cellIndex) => {
    const dx = cell.dx + paddingPx
    const dy = cell.dy + paddingPx
    const photo = cell.imageIndex === null ? null : photos[cell.imageIndex]
    drawCollageCell(ctx, {
      photo,
      dx,
      dy,
      cellWidth,
      cellHeight,
      index: cell.imageIndex ?? cellIndex,
      isFocus: cellIndex === Math.floor((rows * cols) / 2),
      templateId,
    })
  })
}

interface CollageCellRenderInput {
  photo: HTMLImageElement | null
  dx: number
  dy: number
  cellWidth: number
  cellHeight: number
  index: number
  isFocus: boolean
  templateId: CollageTemplateId
}

function drawCollageCell(ctx: CanvasRenderingContext2D, input: CollageCellRenderInput): void {
  const { photo, dx, dy, cellWidth, cellHeight, index, isFocus, templateId } = input

  if (templateId === 'clean') {
    if (!photo) {
      ctx.fillStyle = PLACEHOLDER_COLOR
      ctx.fillRect(dx, dy, cellWidth, cellHeight)
      return
    }
    drawCoverPhoto(ctx, photo, dx, dy, cellWidth, cellHeight)
    return
  }

  if (templateId === 'focus') {
    const border = isFocus ? Math.max(8, cellWidth * 0.035) : Math.max(3, cellWidth * 0.015)
    ctx.fillStyle = isFocus ? '#c65a43' : '#fffdf8'
    ctx.fillRect(dx, dy, cellWidth, cellHeight)
    if (photo) {
      drawCoverPhoto(ctx, photo, dx + border, dy + border, cellWidth - border * 2, cellHeight - border * 2)
    } else {
      ctx.fillStyle = '#ded8cc'
      ctx.fillRect(dx + border, dy + border, cellWidth - border * 2, cellHeight - border * 2)
    }
    return
  }

  const frameInset = templateId === 'film' ? Math.max(7, cellWidth * 0.025) : Math.max(12, cellWidth * 0.04)
  const captionHeight = templateId === 'film' ? cellHeight * 0.11 : cellHeight * 0.14
  const angle = templateId === 'scrapbook' ? [-2.5, 1.4, -0.8, 2.2, 0, -1.7, 1.1, -2, 2.4][index % 9] * (Math.PI / 180) : 0

  ctx.save()
  ctx.translate(dx + cellWidth / 2, dy + cellHeight / 2)
  ctx.rotate(angle)
  if (templateId === 'scrapbook') {
    ctx.shadowColor = 'rgba(67, 55, 42, 0.2)'
    ctx.shadowBlur = cellWidth * 0.035
    ctx.shadowOffsetY = cellWidth * 0.018
  }
  ctx.fillStyle = templateId === 'film' ? '#e7e2d7' : '#fffdf8'
  ctx.fillRect(-cellWidth / 2, -cellHeight / 2, cellWidth, cellHeight)
  ctx.shadowColor = 'transparent'

  const imageX = -cellWidth / 2 + frameInset
  const imageY = -cellHeight / 2 + frameInset
  const imageWidth = cellWidth - frameInset * 2
  const imageHeight = cellHeight - frameInset * 2 - captionHeight
  if (photo) {
    drawCoverPhoto(ctx, photo, imageX, imageY, imageWidth, imageHeight)
  } else {
    ctx.fillStyle = templateId === 'film' ? '#343836' : '#ded8cc'
    ctx.fillRect(imageX, imageY, imageWidth, imageHeight)
  }

  ctx.fillStyle = templateId === 'film' ? '#2d312f' : '#756a5e'
  ctx.font = `600 ${Math.max(11, Math.round(cellWidth * 0.045))}px Inter, sans-serif`
  ctx.textAlign = templateId === 'film' ? 'left' : 'center'
  const labelX = templateId === 'film' ? -cellWidth / 2 + frameInset : 0
  ctx.fillText(String(index + 1).padStart(2, '0'), labelX, cellHeight / 2 - frameInset * 0.65)
  ctx.restore()
}

function drawCoverPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  dx: number,
  dy: number,
  width: number,
  height: number
): void {
  const imageWidth = photo.naturalWidth || photo.width
  const imageHeight = photo.naturalHeight || photo.height
  const source = computeCoverSourceRect({ imageWidth, imageHeight, cellWidth: width, cellHeight: height })
  ctx.drawImage(photo, source.sx, source.sy, source.sWidth, source.sHeight, dx, dy, width, height)
}

function collageBackground(templateId: CollageTemplateId): string {
  if (templateId === 'film') return '#151816'
  if (templateId === 'scrapbook') return '#e9dfcf'
  if (templateId === 'focus') return '#eee9de'
  return GAP_BACKGROUND
}

function renderFixedCollage(
  ctx: CanvasRenderingContext2D,
  photos: HTMLImageElement[],
  templateId: CollageTemplateId,
  gapPx: number,
  paddingPx: number
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (templateId === 'plog') renderPlogCollage(ctx, photos, gapPx, paddingPx)
  if (templateId === 'magazine') renderMagazineCollage(ctx, photos, gapPx, paddingPx)
  if (templateId === 'colorStory') renderColorStoryCollage(ctx, photos, gapPx, paddingPx)
  if (templateId === 'cinematic') renderCinematicCollage(ctx, photos, gapPx, paddingPx)
}

function renderPlogCollage(
  ctx: CanvasRenderingContext2D,
  photos: HTMLImageElement[],
  gap: number,
  padding: number
): void {
  const { width, height } = ctx.canvas
  const pad = Math.max(30, padding)
  const headerHeight = 118
  const footerHeight = 68
  const tileWidth = (width - pad * 2 - gap * 2) / 3
  const tileHeight = (height - pad * 2 - headerHeight - footerHeight - gap * 2) / 3

  ctx.fillStyle = '#f7f3eb'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#222522'
  ctx.textAlign = 'left'
  ctx.font = '800 42px Inter, sans-serif'
  ctx.fillText('DAILY PLOG', pad, pad + 46)
  ctx.fillStyle = '#7b766d'
  ctx.font = '500 18px Inter, sans-serif'
  ctx.fillText(formatCanvasDate(), pad, pad + 78)
  ctx.textAlign = 'right'
  ctx.fillText('NINE LITTLE MOMENTS', width - pad, pad + 46)

  for (let index = 0; index < 9; index += 1) {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = pad + col * (tileWidth + gap)
    const y = pad + headerHeight + row * (tileHeight + gap)
    const captionHeight = Math.max(28, tileHeight * 0.12)
    ctx.fillStyle = '#fffdf8'
    ctx.fillRect(x, y, tileWidth, tileHeight)
    drawPhotoOrPlaceholder(ctx, photos[index], x, y, tileWidth, tileHeight - captionHeight, '#d8d3ca')
    ctx.fillStyle = '#343735'
    ctx.textAlign = 'left'
    ctx.font = `700 ${Math.max(12, tileWidth * 0.045)}px Inter, sans-serif`
    ctx.fillText(`MOMENT ${String(index + 1).padStart(2, '0')}`, x + 12, y + tileHeight - captionHeight * 0.32)
  }

  ctx.textAlign = 'left'
  ctx.fillStyle = '#7b766d'
  ctx.font = '500 16px Inter, sans-serif'
  ctx.fillText('COLLECT THE ORDINARY · KEEP THE LIGHT', pad, height - pad + 4)
}

function renderMagazineCollage(
  ctx: CanvasRenderingContext2D,
  photos: HTMLImageElement[],
  gap: number,
  padding: number
): void {
  const { width, height } = ctx.canvas
  const pad = Math.max(28, padding)
  const contentWidth = width - pad * 2
  const top = 152
  const heroWidth = contentWidth * 0.64
  const heroHeight = 520
  const sideWidth = contentWidth - heroWidth - gap
  const sideHeight = (heroHeight - gap) / 2

  ctx.fillStyle = '#ece8df'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#171a18'
  ctx.textAlign = 'left'
  ctx.font = '900 68px Inter, sans-serif'
  ctx.fillText('THE', pad, 72)
  ctx.fillText('EDIT', pad + 155, 72)
  ctx.font = '500 16px Inter, sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`VISUAL JOURNAL · ${formatCanvasDate()}`, width - pad, 66)

  drawPhotoOrPlaceholder(ctx, photos[0], pad, top, heroWidth, heroHeight, '#b6b2aa')
  drawPhotoOrPlaceholder(ctx, photos[1], pad + heroWidth + gap, top, sideWidth, sideHeight, '#c9c2b7')
  drawPhotoOrPlaceholder(ctx, photos[2], pad + heroWidth + gap, top + sideHeight + gap, sideWidth, sideHeight, '#a8aaa5')

  const lowerTop = top + heroHeight + gap
  const lowerHeight = height - lowerTop - pad
  const narrowWidth = (contentWidth - gap * 2) * 0.28
  const middleWidth = (contentWidth - gap * 2) * 0.44
  drawPhotoOrPlaceholder(ctx, photos[3], pad, lowerTop, narrowWidth, lowerHeight, '#bbb4aa')
  drawPhotoOrPlaceholder(ctx, photos[4], pad + narrowWidth + gap, lowerTop, middleWidth, lowerHeight * 0.58, '#a9a49c')
  drawPhotoOrPlaceholder(
    ctx,
    photos[5],
    pad + narrowWidth + gap,
    lowerTop + lowerHeight * 0.58 + gap,
    middleWidth,
    lowerHeight * 0.42 - gap,
    '#d3cec4'
  )
  const rightX = pad + narrowWidth + gap + middleWidth + gap
  const rightWidth = width - pad - rightX
  drawPhotoOrPlaceholder(ctx, photos[6], rightX, lowerTop, rightWidth, lowerHeight * 0.7, '#979b96')
  ctx.fillStyle = samplePhotoColor(photos[0], '#c65a43')
  ctx.fillRect(rightX, lowerTop + lowerHeight * 0.7 + gap, rightWidth, lowerHeight * 0.3 - gap)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.font = '800 18px Inter, sans-serif'
  ctx.fillText('ISSUE 01', rightX + 14, height - pad - 18)
}

function renderColorStoryCollage(
  ctx: CanvasRenderingContext2D,
  photos: HTMLImageElement[],
  gap: number,
  padding: number
): void {
  const { width, height } = ctx.canvas
  const pad = Math.max(30, padding)
  const headerHeight = 145
  const tileWidth = (width - pad * 2 - gap * 2) / 3
  const tileHeight = (height - pad * 2 - headerHeight - gap * 2) / 3
  const colorSources = [photos[0], photos[2] ?? photos[0], photos[4] ?? photos[1] ?? photos[0]]
  const colorLabels = ['LIGHT / 光', 'EARTH / 土', 'AIR / 空气']

  ctx.fillStyle = '#f4f0e7'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#202320'
  ctx.textAlign = 'left'
  ctx.font = '800 46px Inter, sans-serif'
  ctx.fillText('COLOR STORY', pad, pad + 48)
  ctx.fillStyle = '#747069'
  ctx.font = '500 17px Inter, sans-serif'
  ctx.fillText('SIX SCENES · THREE COLORS · ONE MEMORY', pad, pad + 82)

  let photoIndex = 0
  let colorIndex = 0
  for (let index = 0; index < 9; index += 1) {
    const x = pad + (index % 3) * (tileWidth + gap)
    const y = pad + headerHeight + Math.floor(index / 3) * (tileHeight + gap)
    const isColorBlock = index === 2 || index === 4 || index === 8
    if (!isColorBlock) {
      drawPhotoOrPlaceholder(ctx, photos[photoIndex], x, y, tileWidth, tileHeight, '#d5d0c6')
      photoIndex += 1
      continue
    }

    const color = samplePhotoColor(colorSources[colorIndex], ['#c65a43', '#6f8378', '#d8c6a4'][colorIndex])
    ctx.fillStyle = color
    ctx.fillRect(x, y, tileWidth, tileHeight)
    ctx.strokeStyle = colorBoundary(color, '#f4f0e7')
    ctx.lineWidth = 2
    ctx.strokeRect(x + 1, y + 1, tileWidth - 2, tileHeight - 2)
    ctx.fillStyle = contrastTextColor(color)
    ctx.textAlign = 'left'
    ctx.font = '800 18px Inter, sans-serif'
    ctx.fillText(colorLabels[colorIndex], x + 18, y + 34)
    ctx.font = '500 15px Inter, sans-serif'
    ctx.fillText(color.toUpperCase(), x + 18, y + tileHeight - 22)
    colorIndex += 1
  }
}

function renderCinematicCollage(
  ctx: CanvasRenderingContext2D,
  photos: HTMLImageElement[],
  gap: number,
  padding: number
): void {
  const { width, height } = ctx.canvas
  const pad = Math.max(24, padding)
  const headerHeight = 104
  const footerHeight = 55
  const frameHeight = (height - pad * 2 - headerHeight - footerHeight - gap * 4) / 5

  ctx.fillStyle = '#0d0f0e'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#e6e1d8'
  ctx.textAlign = 'left'
  ctx.font = '800 34px Inter, sans-serif'
  ctx.fillText('CINEMA / 01', pad, pad + 38)
  ctx.textAlign = 'right'
  ctx.font = '500 16px Inter, sans-serif'
  ctx.fillText(formatCanvasDate(), width - pad, pad + 35)

  for (let index = 0; index < 5; index += 1) {
    const x = pad
    const y = pad + headerHeight + index * (frameHeight + gap)
    drawPhotoOrPlaceholder(ctx, photos[index], x, y, width - pad * 2, frameHeight, '#262a28')
    ctx.fillStyle = 'rgba(10, 12, 11, 0.72)'
    ctx.fillRect(x + 10, y + 10, 78, 28)
    ctx.fillStyle = '#f1ece3'
    ctx.textAlign = 'left'
    ctx.font = '700 13px Inter, sans-serif'
    ctx.fillText(`SHOT ${String(index + 1).padStart(2, '0')}`, x + 20, y + 29)
  }

  ctx.fillStyle = '#aaa69f'
  ctx.font = '500 14px Inter, sans-serif'
  ctx.fillText('24 FPS · HUEFRAME MOTION PICTURE', pad, height - pad + 2)
}

function drawPhotoOrPlaceholder(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | undefined,
  x: number,
  y: number,
  width: number,
  height: number,
  placeholder: string
): void {
  if (photo) {
    drawCoverPhoto(ctx, photo, x, y, width, height)
    return
  }
  ctx.fillStyle = placeholder
  ctx.fillRect(x, y, width, height)
}

function samplePhotoColor(photo: HTMLImageElement | undefined, fallback: string): string {
  if (!photo) return fallback
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 20
    canvas.height = 20
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return fallback
    ctx.drawImage(photo, 0, 0, 20, 20)
    const pixels = ctx.getImageData(0, 0, 20, 20).data
    let red = 0
    let green = 0
    let blue = 0
    let count = 0
    for (let index = 0; index < pixels.length; index += 16) {
      if (pixels[index + 3] === 0) continue
      red += pixels[index]
      green += pixels[index + 1]
      blue += pixels[index + 2]
      count += 1
    }
    if (count === 0) return fallback
    return rgbToHex(Math.round(red / count), Math.round(green / count), Math.round(blue / count))
  } catch {
    return fallback
  }
}

function rgbToHex(red: number, green: number, blue: number): string {
  return `#${[red, green, blue].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`
}

function contrastTextColor(hex: string): '#ffffff' | '#171917' {
  const red = Number.parseInt(hex.slice(1, 3), 16)
  const green = Number.parseInt(hex.slice(3, 5), 16)
  const blue = Number.parseInt(hex.slice(5, 7), 16)
  return red * 0.299 + green * 0.587 + blue * 0.114 > 156 ? '#171917' : '#ffffff'
}

function colorBoundary(color: string, background: string): string {
  const colorRgb = hexToRgb(color)
  const backgroundRgb = hexToRgb(background)
  const distance = Math.sqrt(
    (colorRgb[0] - backgroundRgb[0]) ** 2 +
      (colorRgb[1] - backgroundRgb[1]) ** 2 +
      (colorRgb[2] - backgroundRgb[2]) ** 2
  )
  return distance < 70 ? 'rgba(29, 33, 31, 0.34)' : 'rgba(255, 255, 255, 0.26)'
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ]
}

function formatCanvasDate(): string {
  const now = new Date()
  return `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
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
