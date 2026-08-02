import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'

/** 色彩档案：主图与带百分比的色彩索引并置，适合收藏和设计参考。 */
export const renderColorArchive: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const pad = width * 0.045
  const top = height * 0.07
  const imageWidth = width * 0.64
  const contentHeight = height * 0.79
  const railX = pad + imageWidth + width * 0.035
  const railWidth = width - railX - pad

  ctx.fillStyle = '#f8f8f5'
  ctx.fillRect(0, 0, width, height)
  drawImageCover(ctx, photo, pad, top, imageWidth, contentHeight, width * 0.008)

  ctx.fillStyle = '#171918'
  ctx.textAlign = 'left'
  ctx.font = `700 ${Math.round(width * 0.018)}px Inter, sans-serif`
  ctx.fillText('CHROMATIC ARCHIVE', railX, top)

  const visiblePalette = palette.slice(0, 6)
  const listTop = top + height * 0.055
  const itemHeight = (contentHeight - height * 0.055) / Math.max(1, visiblePalette.length)
  visiblePalette.forEach((entry, index) => {
    const y = listTop + index * itemHeight
    const swatchSize = Math.min(railWidth * 0.34, itemHeight * 0.55)
    ctx.fillStyle = entry.hex
    ctx.fillRect(railX, y, swatchSize, swatchSize)
    ctx.fillStyle = '#292d2b'
    ctx.font = `600 ${Math.max(11, Math.round(width * 0.015))}px Inter, sans-serif`
    ctx.fillText(entry.hex.toUpperCase(), railX + swatchSize + width * 0.015, y + swatchSize * 0.4)
    ctx.fillStyle = '#747a76'
    ctx.font = `400 ${Math.max(10, Math.round(width * 0.013))}px Inter, sans-serif`
    const label = `${paletteName(entry, config.colorNameLanguage)} · ${Math.round(entry.percentage ?? 0)}%`
    ctx.fillText(label, railX + swatchSize + width * 0.015, y + swatchSize * 0.78, railWidth - swatchSize)
  })

  ctx.fillStyle = '#171918'
  ctx.font = `400 ${Math.round(width * 0.045)}px ${config.titleFont}`
  ctx.fillText(locationName.toUpperCase(), pad, height * 0.925, width * 0.7)
  ctx.fillStyle = '#747a76'
  ctx.textAlign = 'right'
  ctx.font = `500 ${Math.round(width * 0.016)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, height * 0.925)
}
