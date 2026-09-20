import type { RGB } from './colorExtraction'
import { deltaE } from './colorMath'

/**
 * 超过该 ΔE 才视为"不同的颜色"。取 16 的依据来自实测：同一张照片里被量化出的
 * 近似残色（三个不同明度的象牙白）两两 ΔE 最高只有 14.15，而真正不同的颜色
 * 两两 ΔE 最低也有 42.76——16 落在中间的宽阔间隔带里，两种情形都能正确分开。
 */
const DEFAULT_DISTINCT_THRESHOLD = 16

/** 占比低于该值的色块是量化噪声，不值得占一个展示位。 */
const MIN_VISIBLE_PERCENTAGE = 0.5

/** 色卡最多展示几块。 */
export const PALETTE_TARGET = 6

/** 低于这个块数色带会显得像渲染出错，宁可放宽阈值也要凑够。 */
export const PALETTE_MINIMUM = 3

/** 首选阈值阶梯：在"分得开"的前提下尽量多凑。 */
const PREFERRED_THRESHOLDS = [16, 14, 12, 10] as const

/** 兜底阈值阶梯：只在照片本身色彩单一时使用，换来"至少 PALETTE_MINIMUM 块"。 */
const FALLBACK_THRESHOLDS = [8, 6, 4] as const

/**
 * 把 ColorThief 返回的候选色按感知差异去重：保留排在前面（占比更高）的颜色，
 * 后续与已保留颜色 ΔE 小于阈值的都算作同一色，直接丢弃。
 * 返回保持原有顺序（即占比降序）的去重结果。
 */
export function dedupePaletteColors(
  colors: RGB[],
  threshold = DEFAULT_DISTINCT_THRESHOLD
): RGB[] {
  const kept: RGB[] = []
  for (const color of colors) {
    const isDuplicate = kept.some((existing) => deltaE(existing, color) < threshold)
    if (!isDuplicate) kept.push(color)
  }
  return kept
}

/**
 * 沿阈值阶梯逐级放宽，返回第一个够到 count 块的结果；一级都不够时返回阶梯上
 * 拿到的最多块数（而不是放到阈值 0 全盘接收——那会把近似色又放回来）。
 */
function widenUntil(colors: RGB[], thresholds: readonly number[], count: number): RGB[] {
  let most: RGB[] = []
  for (const threshold of thresholds) {
    const deduped = dedupePaletteColors(colors, threshold)
    if (deduped.length > most.length) most = deduped
    if (deduped.length >= count) return deduped
  }
  return most
}

/**
 * 组出最终色板：优先保证每块之间"肉眼分得开"，宁少勿滥；只有照片本身色彩单一、
 * 连 PALETTE_MINIMUM 块都凑不出时，才放宽阈值换够块数，避免卡片只剩一两块色带。
 */
export function buildDistinctPalette(
  colors: RGB[],
  target: number = PALETTE_TARGET,
  minimum: number = PALETTE_MINIMUM
): RGB[] {
  const preferred = widenUntil(colors, PREFERRED_THRESHOLDS, target)
  if (preferred.length >= minimum) return preferred.slice(0, target)

  const padded = widenUntil(colors, FALLBACK_THRESHOLDS, minimum)
  return (padded.length > preferred.length ? padded : preferred).slice(0, target)
}

/** 丢弃占比过低的色块；若全部低于阈值则原样返回，避免色卡变空。 */
export function dropNegligiblePercentages(
  percentages: number[],
  minPercentage = MIN_VISIBLE_PERCENTAGE
): number[] {
  const visible = percentages.filter((p) => p >= minPercentage)
  if (visible.length === 0) return percentages
  // 只在确有噪声可剔除时才裁剪，防止把有效色块一起丢掉。
  return visible.length < percentages.length ? visible : percentages
}
