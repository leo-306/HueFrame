import type { TemplateRenderer } from './types'

/**
 * 杂志封面版式：照片铺满全画布，顶部大标题（地点名），
 * 底部一条小色卡角标，模拟杂志封面排版感。
 */
export const renderMagazineCover: TemplateRenderer = (ctx, config) => {
  const { photo, palette, locationName, capturedAtText, width, height } = config

  ctx.drawImage(photo, 0, 0, width, height)

  // 顶部渐变遮罩，保证标题可读
  const topGradient = ctx.createLinearGradient(0, 0, 0, height * 0.25)
  topGradient.addColorStop(0, 'rgba(0,0,0,0.55)')
  topGradient.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = topGradient
  ctx.fillRect(0, 0, width, height * 0.25)

  ctx.fillStyle = '#ffffff'
  ctx.font = `bold 48px ${config.titleFont}`
  ctx.textAlign = 'left'
  ctx.fillText(locationName.toUpperCase(), 32, 70)

  ctx.font = '16px sans-serif'
  ctx.fillText(capturedAtText, 32, 100)

  // 底部色卡角标
  const swatchSize = 36
  const swatchGap = 8
  const totalWidth = palette.length * swatchSize + (palette.length - 1) * swatchGap
  const startX = width - totalWidth - 24
  const swatchY = height - swatchSize - 24

  palette.forEach((entry, index) => {
    const x = startX + index * (swatchSize + swatchGap)
    ctx.fillStyle = entry.hex
    ctx.fillRect(x, swatchY, swatchSize, swatchSize)
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'
    ctx.strokeRect(x, swatchY, swatchSize, swatchSize)
  })
}
