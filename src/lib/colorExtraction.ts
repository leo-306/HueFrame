import ColorThief from 'color-thief-browser'
import { drawToWorkCanvas } from './imageScale'

export type RGB = [number, number, number]

const colorThief = new ColorThief()

/** 取色用的工作分辨率上限：MMCQ 本身在 5bit 直方图上跑，再高的图也带不来更多颜色。 */
const WORK_MAX_EDGE = 512

/**
 * 从图像元素（canvas/img）提取主色调列表，按占比排序。
 */
export async function extractPalette(
  source: HTMLCanvasElement | HTMLImageElement,
  colorCount = 6
): Promise<RGB[]> {
  if (source instanceof HTMLImageElement && !source.complete) {
    await new Promise<void>((resolve, reject) => {
      source.addEventListener('load', () => resolve(), { once: true })
      source.addEventListener('error', () => reject(new Error('image failed to load')), { once: true })
    })
  }

  try {
    // 先降采样再取色：color-thief 会按传入图的 intrinsic 尺寸建 canvas 并全图
    // getImageData，12MP 原图意味着几十 MB 的像素缓冲和主线程阻塞；降到 512px
    // 长边后取色结果基本不变，速度快一个数量级。
    const work = drawToWorkCanvas(source, WORK_MAX_EDGE)
    if (work.width === 0 || work.height === 0) return []
    const palette = colorThief.getPalette(work, colorCount) as RGB[] | null
    return palette ? palette.slice(0, colorCount) : []
  } catch {
    return []
  }
}

/**
 * color-thief 会主动丢弃接近纯白的像素，纯色/近白图量化后返回空。
 * 这时从降采样图里取出现次数最多的像素色作为唯一主色，保证任何图至少有一块。
 */
export function fallbackDominantColor(source: HTMLCanvasElement | HTMLImageElement): RGB | null {
  try {
    const work = drawToWorkCanvas(source, 40)
    const ctx = work.getContext('2d')
    if (!ctx || work.width === 0) return null
    const { data } = ctx.getImageData(0, 0, work.width, work.height)
    const counts = new Map<number, { rgb: RGB; n: number }>()
    for (let i = 0; i < data.length; i += 4) {
      // 量化到 16 级/通道，避免抗锯齿产生的微差异各自成桶
      const key =
        ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4)
      const entry = counts.get(key)
      if (entry) entry.n += 1
      else counts.set(key, { rgb: [data[i], data[i + 1], data[i + 2]], n: 1 })
    }
    let best: { rgb: RGB; n: number } | null = null
    for (const entry of counts.values()) {
      if (!best || entry.n > best.n) best = entry
    }
    return best ? best.rgb : null
  } catch {
    return null
  }
}
