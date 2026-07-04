import type { TemplateRenderer } from './types'
import { photoHeightForWidth } from '../lib/cardDimensions'

/**
 * 经典色带版式：照片占上半部分，下半部分是等分色块条，
 * 每块标注色名与 HEX 值，底部居中显示地点与时间。
 */
export const renderClassicStrip: TemplateRenderer = (ctx, config) => {
  const { photo, palette, locationName, capturedAtText, width, height } = config

  ctx.fillStyle = '#faf7f2'
  ctx.fillRect(0, 0, width, height)

  const photoHeight = photoHeightForWidth(photo.naturalWidth, photo.naturalHeight, width)
  ctx.drawImage(photo, 0, 0, width, photoHeight)

  const stripTop = photoHeight
  const stripHeight = Math.round(width * 0.375)
  const swatchWidth = width / palette.length

  palette.forEach((entry, index) => {
    const x = index * swatchWidth
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, stripTop, swatchWidth, stripHeight)

    ctx.fillStyle = entry.textColor
    ctx.font = '16px sans-serif'
    ctx.textAlign = 'center'
    const displayName = config.colorNameLanguage === 'en' ? entry.name.en : entry.name.zh
    ctx.fillText(displayName, x + swatchWidth / 2, stripTop + stripHeight - 30)
    ctx.font = '12px monospace'
    ctx.fillText(entry.hex.toUpperCase(), x + swatchWidth / 2, stripTop + stripHeight - 12)
  })

  ctx.fillStyle = '#333333'
  ctx.font = `18px ${config.titleFont}`
  ctx.textAlign = 'center'
  ctx.fillText(`${locationName}  ·  ${capturedAtText}`, width / 2, height - 20)
}
