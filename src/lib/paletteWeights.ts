import type { RGB } from './colorExtraction'
import { distanceSquared } from './colorMath'

const SAMPLE_SIZE = 40

/**
 * 把图像降采样到 40×40，为每个像素找到欧氏距离最近的调色板颜色，
 * 统计各颜色命中像素数的占比（四舍五入到整数）。
 */
export function computePalettePercentages(
  source: HTMLCanvasElement | HTMLImageElement,
  palette: RGB[]
): number[] {
  if (palette.length === 0) return []

  const canvas = document.createElement('canvas')
  canvas.width = SAMPLE_SIZE
  canvas.height = SAMPLE_SIZE
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

  const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE)
  const counts = new Array(palette.length).fill(0)
  let totalPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const pixel: RGB = [data[i], data[i + 1], data[i + 2]]
    let bestIndex = 0
    let bestDist = distanceSquared(pixel, palette[0])
    for (let p = 1; p < palette.length; p++) {
      const dist = distanceSquared(pixel, palette[p])
      if (dist < bestDist) {
        bestDist = dist
        bestIndex = p
      }
    }
    counts[bestIndex] += 1
    totalPixels += 1
  }

  return counts.map((count) => Math.round((count / totalPixels) * 100))
}
