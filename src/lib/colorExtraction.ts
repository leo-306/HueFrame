import ColorThief from 'color-thief-browser'

export type RGB = [number, number, number]

const colorThief = new ColorThief()

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

  const palette = colorThief.getPalette(source, colorCount) as RGB[]
  return palette.slice(0, colorCount)
}
