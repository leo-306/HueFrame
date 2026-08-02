import type { TemplateRenderer } from './types'
import { drawImageCover, rgba } from './drawing'

/** 拍立得手记：暖纸背景、轻微倾斜相纸与圆形调色盘。 */
export const renderPolaroidJournal: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const cardWidth = width * 0.76
  const cardHeight = height * 0.67
  const cardY = height * 0.08
  const angle = -1.8 * (Math.PI / 180)
  const dominant = palette[0]?.rgb ?? [120, 120, 120]

  ctx.fillStyle = '#eadfce'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = rgba(dominant, 0.1)
  ctx.beginPath()
  ctx.arc(width * 0.84, height * 0.2, width * 0.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(width / 2, cardY + cardHeight / 2)
  ctx.rotate(angle)
  ctx.shadowColor = 'rgba(55, 45, 34, 0.2)'
  ctx.shadowBlur = width * 0.025
  ctx.shadowOffsetY = width * 0.015
  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight)
  ctx.shadowColor = 'transparent'
  const inset = width * 0.035
  drawImageCover(
    ctx,
    photo,
    -cardWidth / 2 + inset,
    -cardHeight / 2 + inset,
    cardWidth - inset * 2,
    cardHeight - inset * 2 - height * 0.105,
    width * 0.008
  )
  ctx.fillStyle = '#37332e'
  ctx.textAlign = 'left'
  ctx.font = `500 ${Math.round(width * 0.025)}px "LXGW WenKai", serif`
  ctx.fillText(locationName, -cardWidth / 2 + inset, cardHeight / 2 - height * 0.055, cardWidth - inset * 2)
  ctx.fillStyle = '#8b8175'
  ctx.textAlign = 'right'
  ctx.font = `500 ${Math.round(width * 0.015)}px Inter, sans-serif`
  ctx.fillText(capturedAtText, cardWidth / 2 - inset, cardHeight / 2 - height * 0.055)
  ctx.restore()

  const visiblePalette = palette.slice(0, 6)
  const radius = width * 0.036
  const gap = width * 0.024
  const totalWidth = visiblePalette.length * radius * 2 + Math.max(0, visiblePalette.length - 1) * gap
  let x = (width - totalWidth) / 2 + radius
  visiblePalette.forEach((entry) => {
    ctx.fillStyle = entry.hex
    ctx.beginPath()
    ctx.arc(x, height * 0.87, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(55, 51, 46, 0.16)'
    ctx.lineWidth = 2
    ctx.stroke()
    x += radius * 2 + gap
  })

  ctx.fillStyle = '#6f665c'
  ctx.textAlign = 'center'
  ctx.font = `500 ${Math.round(width * 0.016)}px Inter, sans-serif`
  ctx.fillText('COLORS FROM THIS MOMENT', width / 2, height * 0.94)
}
