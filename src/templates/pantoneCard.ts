import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'

/** 潘通主色卡：用一张作品、一个主色和清晰编号构成收藏卡片。 */
export const renderPantoneCard: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const dominant = palette[0]
  const pad = width * 0.055
  const photoHeight = height * 0.66
  const colorTop = pad + photoHeight + height * 0.025

  ctx.fillStyle = '#f4f1e9'
  ctx.fillRect(0, 0, width, height)
  drawImageCover(ctx, photo, pad, pad, width - pad * 2, photoHeight, width * 0.012)

  ctx.fillStyle = dominant?.hex ?? '#ded8cb'
  ctx.fillRect(pad, colorTop, width - pad * 2, height * 0.105)

  ctx.fillStyle = '#191b1a'
  ctx.textAlign = 'left'
  ctx.font = `800 ${Math.round(width * 0.022)}px Inter, sans-serif`
  ctx.fillText('COLOR STANDARD', pad, height * 0.855)
  ctx.font = `400 ${Math.round(width * 0.055)}px ${config.titleFont}`
  ctx.fillText(dominant?.hex.toUpperCase() ?? '#DED8CB', pad, height * 0.915)

  ctx.textAlign = 'right'
  ctx.font = `600 ${Math.round(width * 0.018)}px Inter, sans-serif`
  ctx.fillText(
    dominant ? paletteName(dominant, config.colorNameLanguage).toUpperCase() : 'UNTITLED',
    width - pad,
    height * 0.86
  )
  ctx.fillStyle = '#666b68'
  ctx.font = `500 ${Math.round(width * 0.015)}px Inter, sans-serif`
  ctx.fillText(locationName.toUpperCase(), width - pad, height * 0.91, width * 0.42)
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, height * 0.945)
}
