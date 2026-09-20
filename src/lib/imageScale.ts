/**
 * 把图片源按"长边上限"降采样到离屏 canvas。
 * 取色、滤镜、宫格预览都不需要原图全分辨率（卡片只按 800px 宽渲染），
 * 在 12MP 原图上逐像素处理既慢又吃内存；先降采样能省一个数量级的时间。
 */

type ImageSource = HTMLImageElement | HTMLCanvasElement

function sourceSize(source: ImageSource): { width: number; height: number } {
  if (source instanceof HTMLImageElement) {
    return { width: source.naturalWidth, height: source.naturalHeight }
  }
  return { width: source.width, height: source.height }
}

/** 计算限制长边后的目标尺寸，永不放大。 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  if (width <= 0 || height <= 0) return { width: 0, height: 0 }
  const longEdge = Math.max(width, height)
  if (longEdge <= maxEdge) return { width, height }
  const scale = maxEdge / longEdge
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) }
}

/**
 * 把 source 绘制到长边不超过 maxEdge 的离屏 canvas 并返回。
 * 源已经小于上限时仍会复制一份，保证返回值一定是 canvas（color-thief 需要）。
 */
export function drawToWorkCanvas(source: ImageSource, maxEdge: number): HTMLCanvasElement {
  const { width, height } = sourceSize(source)
  const target = fitWithin(width, height, maxEdge)
  const canvas = document.createElement('canvas')
  canvas.width = target.width
  canvas.height = target.height
  if (target.width > 0 && target.height > 0) {
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(source, 0, 0, target.width, target.height)
  }
  return canvas
}
