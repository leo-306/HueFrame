/**
 * 裁剪几何：把"源图 + 目标比例 + 用户平移缩放"换算成源图上的取图矩形，
 * 再据此从画布上裁出结果。纯计算，不依赖 DOM，便于测试。
 */

export interface CropRect {
  /** 取图矩形左上角在源图中的 x 坐标（源图像素） */
  x: number
  /** 取图矩形左上角在源图中的 y 坐标（源图像素） */
  y: number
  /** 取图矩形宽度（源图像素） */
  width: number
  /** 取图矩形高度（源图像素） */
  height: number
}

export interface CropState {
  /** 目标宽高比（宽/高） */
  ratio: number
  /** 缩放系数，1 表示刚好填满目标比例框 */
  scale: number
  /** 归一化平移量，取值范围 [-1, 1]，0 为居中 */
  offsetX: number
  offsetY: number
}

/** 允许的裁剪比例，与版式 Tab 保持一致的三个常用值。 */
export const CROP_RATIOS = [
  { id: '4:5', label: '4:5', value: 4 / 5 },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '16:9', label: '16:9', value: 16 / 9 },
] as const

export const MIN_SCALE = 1
export const MAX_SCALE = 3

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** 目标比例下能覆盖整个画框的最大取图尺寸（源图像素）。 */
export function baseCropSize(
  sourceWidth: number,
  sourceHeight: number,
  ratio: number
): { width: number; height: number } {
  if (sourceWidth <= 0 || sourceHeight <= 0 || ratio <= 0) return { width: 0, height: 0 }
  const widthForHeight = sourceHeight * ratio
  return widthForHeight <= sourceWidth
    ? { width: widthForHeight, height: sourceHeight }
    : { width: sourceWidth, height: sourceWidth / ratio }
}

/**
 * 算出源图上的取图矩形。缩放只会让矩形变小（放大看细节），
 * 平移被限制在矩形仍完整落在源图内，因此结果永远是可裁剪的有效区域。
 */
export function computeCropRect(
  sourceWidth: number,
  sourceHeight: number,
  state: CropState
): CropRect {
  const base = baseCropSize(sourceWidth, sourceHeight, state.ratio)
  if (base.width <= 0 || base.height <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const scale = clamp(state.scale, MIN_SCALE, MAX_SCALE)
  const width = base.width / scale
  const height = base.height / scale

  // 矩形能移动的范围：从贴左边缘到贴右边缘，offset -1 → 最左，1 → 最右。
  const slackX = Math.max(0, sourceWidth - width)
  const slackY = Math.max(0, sourceHeight - height)

  return {
    x: slackX * (clamp(state.offsetX, -1, 1) + 1) / 2,
    y: slackY * (clamp(state.offsetY, -1, 1) + 1) / 2,
    width,
    height,
  }
}

/** 裁剪结果的导出尺寸：长边固定，避免导出图随源图分辨率无限变大。 */
export function croppedExportSize(rect: CropRect, longEdge = 1600): { width: number; height: number } {
  if (rect.width <= 0 || rect.height <= 0) return { width: 0, height: 0 }
  const ratio = rect.width / rect.height
  if (rect.width >= rect.height) {
    return { width: Math.round(longEdge), height: Math.round(longEdge / ratio) }
  }
  return { width: Math.round(longEdge * ratio), height: Math.round(longEdge) }
}
