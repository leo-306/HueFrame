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

  try {
    // 图片几乎没有可提取的颜色（如纯白）时，color-thief-browser 会返回 null；
    // 某些像素分布还会触发其内部量化代码抛出异常，一并兜底为空数组。
    const palette = colorThief.getPalette(source, colorCount) as RGB[] | null
    return palette ? palette.slice(0, colorCount) : []
  } catch {
    return []
  }
}
