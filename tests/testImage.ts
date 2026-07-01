import { createCanvas, Image as CanvasImage } from 'canvas'

/**
 * jsdom 的原生 Image 从不真正解码图片（naturalWidth 恒为 0，onload 不触发），
 * 导致 node-canvas 的 drawImage 会因"图片未加载完成"报错。
 * 这里用 node-canvas 生成一张真实的纯色图片，绕过这个测试环境限制。
 */
export function createTestPhoto(width = 200, height = 200): HTMLImageElement {
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#888888'
  ctx.fillRect(0, 0, width, height)
  const img = new CanvasImage()
  img.src = canvas.toBuffer('image/png')
  return img as unknown as HTMLImageElement
}
