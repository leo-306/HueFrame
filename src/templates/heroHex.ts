import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'
import { formatColorValue } from '../lib/colorFormat'

/**
 * 候选 A · 主色巨卡：主色占大块、放大 HEX/RGB，其余色作底部细条。
 * 参考 iColorPalette / ins 高级感配色卡。
 */
export const renderHeroHex: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const format = config.colorFormat ?? 'hex'
  if (palette.length === 0) return

  ctx.fillStyle = '#f6f4ef'
  ctx.fillRect(0, 0, width, height)

  const pad = width * 0.05
  const photoHeight = height * 0.46
  drawImageCover(ctx, photo, pad, pad, width - pad * 2, photoHeight, width * 0.02)

  const dominant = palette[0]
  const heroTop = pad + photoHeight + height * 0.03
  const heroHeight = height * 0.3
  ctx.fillStyle = dominant.hex
  ctx.fillRect(pad, heroTop, width - pad * 2, heroHeight)

  ctx.fillStyle = dominant.textColor
  ctx.textAlign = 'left'
  const heroValue = formatColorValue(dominant.rgb, format)
  ctx.font = `700 ${Math.round(width * 0.085)}px Inter, sans-serif`
  ctx.fillText(heroValue, pad + width * 0.04, heroTop + heroHeight * 0.52, width - pad * 2 - width * 0.08)
  ctx.font = `400 ${Math.round(width * 0.026)}px Inter, sans-serif`
  ctx.fillText(
    `${paletteName(dominant, config.colorNameLanguage)} · ${Math.round(dominant.percentage ?? 0)}%`,
    pad + width * 0.04,
    heroTop + heroHeight * 0.78
  )

  // 底部其余色细条
  const rest = palette.slice(1)
  const stripTop = heroTop + heroHeight + height * 0.028
  const stripHeight = height * 0.1
  const gap = width * 0.012
  const sw = rest.length > 0 ? (width - pad * 2 - gap * (rest.length - 1)) / rest.length : 0
  rest.forEach((entry, i) => {
    const x = pad + i * (sw + gap)
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, stripTop, sw, stripHeight)
    ctx.fillStyle = entry.textColor
    ctx.textAlign = 'center'
    ctx.font = `500 ${Math.max(8, Math.round(width * 0.014))}px monospace`
    ctx.fillText(formatColorValue(entry.rgb, format), x + sw / 2, stripTop + stripHeight * 0.58, sw - 4)
  })

  ctx.fillStyle = '#2a2c29'
  ctx.textAlign = 'left'
  ctx.font = `400 ${Math.round(width * 0.03)}px ${config.titleFont}`
  ctx.fillText(locationName, pad, height - height * 0.035, width * 0.6)
  ctx.fillStyle = '#9a9e9a'
  ctx.textAlign = 'right'
  ctx.font = `400 ${Math.round(width * 0.02)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, height - height * 0.035)
}
