import type { RGB } from './colorExtraction'

export interface ColorName {
  zh: string
  en: string
  rgb: RGB
}

// 中国传统色 + 常用色名参考表（节选，可持续扩充）
const COLOR_TABLE: ColorName[] = [
  { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
  { zh: '朱砂', en: 'Cinnabar', rgb: [200, 40, 30] },
  { zh: '橘橙', en: 'Tangerine', rgb: [235, 130, 40] },
  { zh: '姜黄', en: 'Turmeric', rgb: [220, 170, 30] },
  { zh: '橄榄', en: 'Olive', rgb: [110, 120, 50] },
  { zh: '竹青', en: 'Bamboo Green', rgb: [90, 150, 90] },
  { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] },
  { zh: '群青', en: 'Ultramarine', rgb: [30, 60, 200] },
  { zh: '藏青', en: 'Navy', rgb: [20, 30, 90] },
  { zh: '藕荷', en: 'Lotus Mauve', rgb: [180, 140, 180] },
  { zh: '黛紫', en: 'Dusk Violet', rgb: [90, 50, 110] },
  { zh: '象牙白', en: 'Ivory', rgb: [240, 235, 220] },
  { zh: '墨灰', en: 'Ink Grey', rgb: [70, 70, 75] },
  { zh: '玄黑', en: 'Deep Black', rgb: [20, 20, 25] },
]

function distanceSquared(a: RGB, b: RGB): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

/**
 * 在参考色表中找到与输入 RGB 欧氏距离最近的色名。
 */
export function nearestColorName(rgb: RGB): ColorName {
  let best = COLOR_TABLE[0]
  let bestDist = distanceSquared(rgb, best.rgb)

  for (const candidate of COLOR_TABLE.slice(1)) {
    const dist = distanceSquared(rgb, candidate.rgb)
    if (dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }

  return best
}
