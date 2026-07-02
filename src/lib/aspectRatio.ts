export const ASPECT_RATIOS = ['4:5', '1:1', '16:9'] as const
export type AspectRatioId = (typeof ASPECT_RATIOS)[number]

const BASE_WIDTH = 800

const RATIO_FACTORS: Record<AspectRatioId, number> = {
  '4:5': 5 / 4,
  '1:1': 1,
  '16:9': 9 / 16,
}

/**
 * 固定宽度为 800px，按比例换算出对应高度，用于版式 Tab 的比例切换。
 */
export function dimensionsForAspectRatio(ratio: AspectRatioId): { width: number; height: number } {
  return {
    width: BASE_WIDTH,
    height: Math.round(BASE_WIDTH * RATIO_FACTORS[ratio]),
  }
}
