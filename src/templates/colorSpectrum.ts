import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'
import { formatColorValue } from '../lib/colorFormat'

/**
 * 候选 · 色彩光谱卡：照片 + 由提取色插值出的平滑渐变色带 + 离散色块。
 * 参考小红书高赞的"渐变/光谱"色卡（如"水的百种色彩"），
 * 渐变色带按各色占比加权，dominant 色占据更长区间，反映真实色彩分布。
 */
export const renderColorSpectrum: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const format = config.colorFormat ?? 'hex'
  if (palette.length === 0) return

  ctx.fillStyle = '#f6f4ef'
  ctx.fillRect(0, 0, width, height)

  const pad = width * 0.05
  const photoHeight = height * 0.42
  drawImageCover(ctx, photo, pad, pad, width - pad * 2, photoHeight, width * 0.02)

  // 渐变色带：色标位置按占比累计，dominant 色占更长区间
  const gradTop = pad + photoHeight + height * 0.035
  const gradHeight = height * 0.26
  const total = palette.reduce((sum, e) => sum + (e.percentage ?? 0), 0) || palette.length
  const gradient = ctx.createLinearGradient(pad, 0, width - pad, 0)
  let acc = 0
  palette.forEach((entry) => {
    const share = (entry.percentage ?? 0) / total
    // 每色占 [acc, acc+share]，端点处把色标往里收一点，避免相邻同色硬边
    const start = acc
    const end = acc + share
    gradient.addColorStop(Math.min(0.999, start + share * 0.001), entry.hex)
    gradient.addColorStop(Math.max(0.001, end - share * 0.001), entry.hex)
    acc = end
  })
  ctx.fillStyle = gradient
  ctx.fillRect(pad, gradTop, width - pad * 2, gradHeight)

  ctx.fillStyle = '#2a2c29'
  ctx.textAlign = 'left'
  ctx.font = `500 ${Math.round(width * 0.018)}px Inter, sans-serif`
  ctx.fillText('COLOR SPECTRUM', pad, gradTop - height * 0.012)

  // 离散色块行
  const swTop = gradTop + gradHeight + height * 0.03
  const swHeight = height * 0.13
  const gap = width * 0.012
  const sw = (width - pad * 2 - gap * (palette.length - 1)) / palette.length
  palette.forEach((entry, i) => {
    const x = pad + i * (sw + gap)
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, swTop, sw, swHeight)
    ctx.fillStyle = entry.textColor
    ctx.textAlign = 'center'
    ctx.font = `500 ${Math.max(8, Math.round(width * 0.015))}px monospace`
    ctx.fillText(formatColorValue(entry.rgb, format), x + sw / 2, swTop + swHeight * 0.55, sw - 4)
    ctx.font = `400 ${Math.max(7, Math.round(width * 0.0125))}px Inter, sans-serif`
    ctx.fillText(paletteName(entry, config.colorNameLanguage), x + sw / 2, swTop + swHeight * 0.85, sw - 4)
  })

  // 底部地点
  ctx.fillStyle = '#2a2c29'
  ctx.textAlign = 'left'
  ctx.font = `400 ${Math.round(width * 0.03)}px ${config.titleFont}`
  ctx.fillText(locationName, pad, height - height * 0.035, width * 0.6)
  ctx.fillStyle = '#9a9e9a'
  ctx.textAlign = 'right'
  ctx.font = `400 ${Math.round(width * 0.02)}px Inter, sans-serif`
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, height - height * 0.035)
}
