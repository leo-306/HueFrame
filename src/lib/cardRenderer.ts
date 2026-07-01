import type { CardConfig, TemplateRenderer } from '../templates/types'

/**
 * 用指定的版式渲染函数把 CardConfig 画进一个新建的 canvas。
 */
export function renderCardToCanvas(config: CardConfig, renderer: TemplateRenderer): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height
  const ctx = canvas.getContext('2d')!
  renderer(ctx, config)
  return canvas
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
