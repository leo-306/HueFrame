import type { RGB } from '../lib/colorExtraction'

export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0
): void {
  const imageWidth = photo.naturalWidth || photo.width
  const imageHeight = photo.naturalHeight || photo.height
  const sourceRatio = imageWidth / imageHeight
  const targetRatio = width / height
  let sx = 0
  let sy = 0
  let sourceWidth = imageWidth
  let sourceHeight = imageHeight

  if (sourceRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio
    sx = (imageWidth - sourceWidth) / 2
  } else {
    sourceHeight = imageWidth / targetRatio
    sy = (imageHeight - sourceHeight) / 2
  }

  ctx.save()
  if (radius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.clip()
  }
  ctx.drawImage(photo, sx, sy, sourceWidth, sourceHeight, x, y, width, height)
  ctx.restore()
}

/** 完整显示照片，在目标区域不足的方向保留背景，不裁掉竖图标题或边缘内容。 */
export function drawImageContain(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0,
  background = '#ded9cf'
): void {
  const imageWidth = photo.naturalWidth || photo.width
  const imageHeight = photo.naturalHeight || photo.height
  const scale = Math.min(width / imageWidth, height / imageHeight)
  const drawWidth = imageWidth * scale
  const drawHeight = imageHeight * scale
  const drawX = x + (width - drawWidth) / 2
  const drawY = y + (height - drawHeight) / 2

  ctx.save()
  if (radius > 0) {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.clip()
  }
  ctx.fillStyle = background
  ctx.fillRect(x, y, width, height)
  ctx.drawImage(photo, drawX, drawY, drawWidth, drawHeight)
  ctx.restore()
}

export function rgba([r, g, b]: RGB, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function paletteName(
  entry: { name: { zh: string; en: string } },
  language: 'zh' | 'en'
): string {
  return language === 'en' ? entry.name.en : entry.name.zh
}

export interface PalettePoint {
  x: number
  y: number
}

/** 在照片的实际展示裁切中，为每个色票寻找颜色最接近的像素位置。 */
export function findPalettePoints(
  photo: HTMLImageElement,
  colors: RGB[],
  sampleSize = 72
): PalettePoint[] {
  if (colors.length === 0) return []

  try {
    const canvas = document.createElement('canvas')
    canvas.width = sampleSize
    canvas.height = sampleSize
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) throw new Error('canvas context unavailable')

    drawImageCover(ctx, photo, 0, 0, sampleSize, sampleSize)
    const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data

    return colors.map(([targetR, targetG, targetB], colorIndex) => {
      let closestIndex = 0
      let closestDistance = Number.POSITIVE_INFINITY
      const stride = colorIndex % 2 === 0 ? 1 : 2

      for (let pixelIndex = 0; pixelIndex < sampleSize * sampleSize; pixelIndex += stride) {
        const offset = pixelIndex * 4
        if (pixels[offset + 3] === 0) continue
        const red = pixels[offset] - targetR
        const green = pixels[offset + 1] - targetG
        const blue = pixels[offset + 2] - targetB
        const distance = red * red + green * green + blue * blue
        if (distance < closestDistance) {
          closestDistance = distance
          closestIndex = pixelIndex
        }
      }

      return {
        x: (closestIndex % sampleSize) / sampleSize,
        y: Math.floor(closestIndex / sampleSize) / sampleSize,
      }
    })
  } catch {
    return colors.map((_, index) => ({
      x: 0.16 + (index % 2) * 0.46,
      y: 0.18 + (index / Math.max(1, colors.length - 1)) * 0.62,
    }))
  }
}
