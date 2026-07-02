export const FILTERS = ['none', 'warmFilm', 'coolFilm', 'vintagePositive'] as const
export type FilterName = (typeof FILTERS)[number]

type ChannelTransform = (r: number, g: number, b: number) => [number, number, number]

const clamp = (value: number) => Math.max(0, Math.min(255, value))

const TRANSFORMS: Record<FilterName, ChannelTransform> = {
  none: (r, g, b) => [r, g, b],
  // 暖调胶片：提升红色，压低蓝色，模拟暖色调相机发色
  warmFilm: (r, g, b) => [clamp(r * 1.15 + 10), clamp(g * 1.03), clamp(b * 0.85)],
  // 冷调胶片：提升蓝色，压低红色
  coolFilm: (r, g, b) => [clamp(r * 0.9), clamp(g * 1.02), clamp(b * 1.15 + 8)],
  // 复古正片：整体降低对比度并轻微偏黄绿
  vintagePositive: (r, g, b) => [clamp(r * 0.95 + 15), clamp(g * 0.97 + 10), clamp(b * 0.85)],
}

/**
 * 原地修改 canvas 的像素数据，应用指定滤镜的颜色变换。
 */
export function applyFilter(canvas: HTMLCanvasElement, filter: FilterName): void {
  const ctx = canvas.getContext('2d')!
  const transform = TRANSFORMS[filter]
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b] = transform(data[i], data[i + 1], data[i + 2])
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 生成指定滤镜应用后的缩略图（居中裁剪填满 size×size 正方形），
 * 用于滤镜选择器展示实时预览，而不只是文字按钮。
 */
export function createFilterThumbnail(
  photo: HTMLImageElement,
  filter: FilterName,
  size: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const scale = Math.max(size / photo.width, size / photo.height)
  const sw = size / scale
  const sh = size / scale
  const sx = (photo.width - sw) / 2
  const sy = (photo.height - sh) / 2
  ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, size, size)

  applyFilter(canvas, filter)
  return canvas
}
