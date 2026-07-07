import type { CardConfig, TemplateRenderer } from '../templates/types'

const PAGE_BACKGROUND = '#f9f9f8'

/**
 * 把 CardConfig 合成进指定的 canvas 2D 上下文：
 * 1. 若设置了留白（marginPx），先铺页面背景色，再把版式渲染进按留白
 *    缩小后的内层画布，合成回留白位置——版式渲染函数本身不需要知道
 *    "留白"这个概念。
 * 2. 若开启水印，在合成之后于外层画布的绝对右下角画 "HueFrame" 字样，
 *    水印位置与留白大小、版式种类无关。
 */
export function renderCardWithMargin(
  ctx: CanvasRenderingContext2D,
  config: CardConfig,
  renderer: TemplateRenderer
): void {
  const { width, height } = config
  const marginPx = config.marginPx ?? 0

  if (marginPx > 0) {
    ctx.fillStyle = PAGE_BACKGROUND
    ctx.fillRect(0, 0, width, height)
  }

  const innerWidth = width - marginPx * 2
  const innerHeight = height - marginPx * 2
  const innerCanvas = document.createElement('canvas')
  innerCanvas.width = innerWidth
  innerCanvas.height = innerHeight
  const innerCtx = innerCanvas.getContext('2d')!
  renderer(innerCtx, { ...config, width: innerWidth, height: innerHeight })
  ctx.drawImage(innerCanvas, marginPx, marginPx)

  if (config.watermarkEnabled) {
    const watermarkOpacity = Math.min(1, Math.max(0, config.watermarkOpacity ?? 0.55))
    ctx.fillStyle = `rgba(26, 28, 28, ${watermarkOpacity})`
    ctx.font = '20px Inter, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('HueFrame', width - 20, height - 20)
  }
}

/**
 * 把 canvas 导出为 PNG Blob，用于下载。
 */
export function exportCanvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      } else {
        reject(new Error('canvas.toBlob returned null'))
      }
    }, 'image/png')
  })
}
