import type { TemplateRenderer } from './types'
import { drawImageCover, findPalettePoints, paletteName } from './drawing'

/** 色彩注记：把照片里的真实取色点与右侧色票逐一连线。 */
export const renderColorAnnotation: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const pad = width * 0.055
  const photoX = pad
  const photoY = height * 0.11
  const photoWidth = width * 0.65
  const photoHeight = height * 0.69
  const railX = photoX + photoWidth + width * 0.035
  const railWidth = width - railX - pad
  const visiblePalette = palette.slice(0, 5)
  const points = findPalettePoints(photo, visiblePalette.map((entry) => entry.rgb))

  ctx.fillStyle = '#f7f5ef'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#1d211f'
  ctx.textAlign = 'left'
  ctx.font = `800 ${Math.round(width * 0.026)}px Inter, sans-serif`
  ctx.fillText('PALETTE MAP', pad, height * 0.066)
  ctx.textAlign = 'right'
  ctx.font = `500 ${Math.round(width * 0.015)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'COLOR NOTES', width - pad, height * 0.066)

  drawImageCover(ctx, photo, photoX, photoY, photoWidth, photoHeight, width * 0.01)

  const itemHeight = photoHeight / Math.max(1, visiblePalette.length)
  visiblePalette.forEach((entry, index) => {
    const pointX = photoX + points[index].x * photoWidth
    const pointY = photoY + points[index].y * photoHeight
    const swatchSize = Math.min(railWidth * 0.72, itemHeight * 0.38)
    const swatchY = photoY + index * itemHeight + itemHeight * 0.2
    const targetX = railX
    const targetY = swatchY + swatchSize / 2

    ctx.strokeStyle = 'rgba(29, 33, 31, 0.42)'
    ctx.lineWidth = Math.max(3, width * 0.004)
    ctx.beginPath()
    ctx.moveTo(pointX, pointY)
    ctx.lineTo(photoX + photoWidth, pointY)
    ctx.lineTo(targetX, targetY)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(247, 245, 239, 0.94)'
    ctx.lineWidth = Math.max(1.5, width * 0.002)
    ctx.stroke()

    ctx.fillStyle = entry.hex
    ctx.beginPath()
    ctx.arc(pointX, pointY, width * 0.009, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = Math.max(1.5, width * 0.002)
    ctx.stroke()

    ctx.fillStyle = entry.hex
    ctx.fillRect(targetX, swatchY, swatchSize, swatchSize)
    ctx.fillStyle = '#242825'
    ctx.textAlign = 'left'
    ctx.font = `700 ${Math.max(14, Math.round(width * 0.0175))}px Inter, sans-serif`
    ctx.fillText(entry.hex.toUpperCase(), targetX, swatchY + swatchSize + height * 0.017)
  })

  ctx.fillStyle = '#1d211f'
  ctx.textAlign = 'left'
  ctx.font = `400 ${Math.round(width * 0.046)}px ${config.titleFont}`
  ctx.fillText(locationName.toUpperCase(), pad, height * 0.88, width - pad * 2)
  ctx.fillStyle = '#6e746f'
  ctx.font = `500 ${Math.round(width * 0.015)}px Inter, sans-serif`
  ctx.fillText(
    visiblePalette.map((entry) => paletteName(entry, config.colorNameLanguage)).join(' · '),
    pad,
    height * 0.93,
    width - pad * 2
  )
}
