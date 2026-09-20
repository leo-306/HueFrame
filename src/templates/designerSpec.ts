import type { TemplateRenderer } from './types'
import { drawImageCover, paletteName } from './drawing'
import { bestContrastRatio, formatColorValue } from '../lib/colorFormat'

/**
 * 设计师规格卡：主图 + 逐色的完整数据（色名 / HEX / RGB / HSL / 对比度）。
 * 对照主流色卡工具（Coolors、9grid 等）都提供多格式色值，这一版把三种格式
 * 和 WCAG 对比度一起摆在卡片上，方便直接拿去用。
 */
export const renderDesignerSpec: TemplateRenderer = (ctx, config) => {
  const { width, height, photo, palette, locationName, capturedAtText } = config
  const format = config.colorFormat ?? 'hex'

  ctx.fillStyle = '#f4f3ef'
  ctx.fillRect(0, 0, width, height)

  const pad = width * 0.05
  const headerHeight = height * 0.09
  const photoTop = headerHeight
  const photoHeight = height * 0.34
  drawImageCover(ctx, photo, pad, photoTop, width - pad * 2, photoHeight, width * 0.01)

  // 顶部标题
  ctx.fillStyle = '#1b1c1a'
  ctx.textAlign = 'left'
  ctx.font = `700 ${Math.round(width * 0.026)}px Inter, sans-serif`
  ctx.fillText('COLOR SPEC', pad, headerHeight * 0.52)
  ctx.fillStyle = '#8a8f8a'
  ctx.font = `400 ${Math.round(width * 0.016)}px Inter, sans-serif`
  ctx.textAlign = 'right'
  ctx.fillText(capturedAtText || 'HUEFRAME', width - pad, headerHeight * 0.52)

  // 逐色数据列表
  const listTop = photoTop + photoHeight + height * 0.035
  const listHeight = height - listTop - height * 0.11
  const visible = palette.slice(0, 6)
  const rowHeight = listHeight / Math.max(1, visible.length)
  const swatchWidth = width * 0.2
  const textX = pad + swatchWidth + width * 0.03

  visible.forEach((entry, index) => {
    const y = listTop + index * rowHeight
    const swatchHeight = rowHeight * 0.72

    ctx.fillStyle = entry.hex
    ctx.fillRect(pad, y, swatchWidth, swatchHeight)

    ctx.textAlign = 'left'
    const name = paletteName(entry, config.colorNameLanguage)
    ctx.fillStyle = '#1b1c1a'
    ctx.font = `600 ${Math.round(width * 0.021)}px Inter, sans-serif`
    ctx.fillText(name, textX, y + swatchHeight * 0.34)

    // 主色值（跟随所选格式）+ 另外两种格式作小字补充
    ctx.fillStyle = '#3a3d3a'
    ctx.font = `500 ${Math.max(11, Math.round(width * 0.0165))}px monospace`
    ctx.fillText(formatColorValue(entry.rgb, format), textX, y + swatchHeight * 0.72)

    const others = (['hex', 'rgb', 'hsl'] as const)
      .filter((f) => f !== format)
      .map((f) => formatColorValue(entry.rgb, f))
      .join('   ')
    ctx.fillStyle = '#9a9e9a'
    ctx.font = `400 ${Math.max(9, Math.round(width * 0.0135))}px monospace`
    ctx.fillText(others, textX, y + swatchHeight * 1.02, width - textX - pad)

    // 右侧对比度
    ctx.textAlign = 'right'
    ctx.fillStyle = '#6b6f6b'
    ctx.font = `500 ${Math.max(10, Math.round(width * 0.0145))}px Inter, sans-serif`
    ctx.fillText(`对比 ${bestContrastRatio(entry.rgb).toFixed(1)}`, width - pad, y + swatchHeight * 0.34)
  })

  // 底部地点
  ctx.textAlign = 'left'
  ctx.fillStyle = '#1b1c1a'
  ctx.font = `400 ${Math.round(width * 0.028)}px ${config.titleFont}`
  ctx.fillText(locationName, pad, height - height * 0.045, width - pad * 2)
}
