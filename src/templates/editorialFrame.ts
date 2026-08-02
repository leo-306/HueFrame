import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'

/** 留白刊物：不对称照片、纵向色票与克制的刊物信息层级。 */
export const renderEditorialFrame: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const pad = width * 0.07
  const headerY = height * 0.07
  const photoY = height * 0.16
  const photoWidth = width * 0.67
  const photoHeight = height * 0.66
  const railX = pad + photoWidth + width * 0.035
  const railWidth = width - railX - pad

  ctx.fillStyle = '#f1eee7'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#202321'
  ctx.textAlign = 'left'
  ctx.font = `700 ${Math.round(width * 0.032)}px Inter, sans-serif`
  ctx.fillText('HUE / FRAME', pad, headerY)
  ctx.textAlign = 'right'
  ctx.font = `500 ${Math.round(width * 0.018)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'COLOR STUDY', width - pad, headerY)

  drawImageCover(ctx, photo, pad, photoY, photoWidth, photoHeight, width * 0.012)

  const visiblePalette = palette.slice(0, 6)
  const swatchGap = width * 0.014
  const swatchHeight = (photoHeight - swatchGap * Math.max(0, visiblePalette.length - 1)) / Math.max(1, visiblePalette.length)
  visiblePalette.forEach((entry, index) => {
    const y = photoY + index * (swatchHeight + swatchGap)
    ctx.fillStyle = entry.hex
    ctx.beginPath()
    ctx.roundRect(railX, y, railWidth, swatchHeight, width * 0.01)
    ctx.fill()
    ctx.fillStyle = entry.textColor
    ctx.textAlign = 'center'
    ctx.font = `600 ${Math.max(11, Math.round(width * 0.016))}px Inter, sans-serif`
    ctx.fillText(entry.hex.toUpperCase(), railX + railWidth / 2, y + swatchHeight * 0.54)
  })

  ctx.fillStyle = '#202321'
  ctx.textAlign = 'left'
  ctx.font = `400 ${Math.round(width * 0.052)}px ${config.titleFont}`
  ctx.fillText(locationName.toUpperCase(), pad, height * 0.89, width - pad * 2)
  ctx.fillStyle = '#666b67'
  ctx.font = `500 ${Math.round(width * 0.017)}px Inter, sans-serif`
  const paletteSummary = visiblePalette.slice(0, 3).map((entry) => paletteName(entry, config.colorNameLanguage)).join(' · ')
  ctx.fillText(paletteSummary, pad, height * 0.94, width - pad * 2)
}
