import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'
import { formatColorValue } from '../lib/colorFormat'

/**
 * 候选 B · 横带色谱：照片 + 全宽横色带堆叠，每条标色名 / 色值 / 占比。
 * 参考北欧极简配色卡，信息密度高、留白干净。
 */
export const renderBandList: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const format = config.colorFormat ?? 'hex'

  ctx.fillStyle = '#f3f2ec'
  ctx.fillRect(0, 0, width, height)

  const pad = width * 0.06
  const photoHeight = height * 0.38
  drawImageCover(ctx, photo, pad, pad, width - pad * 2, photoHeight, width * 0.015)

  const listTop = pad + photoHeight + height * 0.03
  const listBottom = height - height * 0.12
  const visible = palette.slice(0, 6)
  const bandGap = height * 0.012
  const bandHeight = (listBottom - listTop - bandGap * (visible.length - 1)) / Math.max(1, visible.length)

  visible.forEach((entry, index) => {
    const y = listTop + index * (bandHeight + bandGap)
    ctx.fillStyle = entry.hex
    ctx.fillRect(pad, y, width - pad * 2, bandHeight)

    ctx.fillStyle = entry.textColor
    ctx.textAlign = 'left'
    ctx.font = `600 ${Math.max(12, Math.round(width * 0.024))}px Inter, sans-serif`
    ctx.fillText(paletteName(entry, config.colorNameLanguage), pad + width * 0.03, y + bandHeight * 0.62, (width - pad * 2) * 0.4)

    ctx.textAlign = 'right'
    ctx.font = `500 ${Math.max(10, Math.round(width * 0.02))}px monospace`
    ctx.fillText(formatColorValue(entry.rgb, format), width - pad - width * 0.03, y + bandHeight * 0.62)
    ctx.font = `400 ${Math.max(9, Math.round(width * 0.016))}px Inter, sans-serif`
    ctx.fillText(`${Math.round(entry.percentage ?? 0)}%`, width - pad - width * 0.03, y + bandHeight * 0.9)
  })

  ctx.fillStyle = '#2a2c29'
  ctx.textAlign = 'left'
  ctx.font = `400 ${Math.round(width * 0.032)}px ${config.titleFont}`
  ctx.fillText(locationName, pad, height - height * 0.05, width - pad * 2)
  ctx.fillStyle = '#9a9e9a'
  ctx.textAlign = 'right'
  ctx.font = `400 ${Math.round(width * 0.018)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, height - height * 0.05)
}
