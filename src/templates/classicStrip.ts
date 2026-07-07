import type { TemplateRenderer } from './types'
import { photoHeightForWidth } from '../lib/cardDimensions'
import { CARD_INFO_FONT_FAMILY } from '../lib/fonts'

function setFittedFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxSize: number,
  minSize: number,
  family: string,
  weight?: number
): void {
  const font = (size: number) => `${weight ? `${weight} ` : ''}${size}px ${family}`
  ctx.font = font(maxSize)
  const measuredWidth = ctx.measureText(text).width
  if (measuredWidth <= maxWidth) return
  const fittedSize = Math.max(minSize, Math.floor((maxSize * maxWidth) / measuredWidth))
  ctx.font = font(fittedSize)
}

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
  const swatchGap = Math.max(0, config.swatchGapPx ?? 0)
  const swatchRadius = Math.max(0, config.swatchRadiusPx ?? 0)
  const totalGap = Math.max(0, palette.length - 1) * swatchGap
  const swatchWidth = palette.length > 0 ? (width - totalGap) / palette.length : 0

  palette.forEach((entry, index) => {
    const x = index * (swatchWidth + swatchGap)
    ctx.fillStyle = entry.hex
    if (swatchRadius > 0) {
      ctx.beginPath()
      ctx.roundRect(x, stripTop, swatchWidth, stripHeight, Math.min(swatchRadius, swatchWidth / 2, stripHeight / 2))
      ctx.fill()
    } else {
      ctx.fillRect(x, stripTop, swatchWidth, stripHeight)
    }

    ctx.fillStyle = entry.textColor
    ctx.textAlign = 'center'
    const displayName = config.colorNameLanguage === 'en' ? entry.name.en : entry.name.zh
    setFittedFont(ctx, displayName, swatchWidth - 12, 24, 16, 'sans-serif')
    const nameY = stripTop + Math.round(stripHeight * 0.45)
    ctx.fillText(displayName, x + swatchWidth / 2, nameY)
    ctx.font = '16px monospace'
    ctx.fillText(entry.hex.toUpperCase(), x + swatchWidth / 2, nameY + 42)
  })

  ctx.fillStyle = '#333333'
  ctx.textAlign = 'center'
  const information = [locationName, capturedAtText].filter(Boolean).join('  ·  ')
  setFittedFont(ctx, information, width - 48, 32, 20, CARD_INFO_FONT_FAMILY, 500)
  ctx.fillText(information, width / 2, height - 32)
}
