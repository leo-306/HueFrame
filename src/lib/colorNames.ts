import type { RGB } from './colorExtraction'
import { distanceSquared, rgbToLab } from './colorMath'

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

/** 色名表粒度远粗于去重阈值，同一张色卡里常出现两个同名色块。 */
export interface NamedColor {
  name: ColorName
  rgb: RGB
}

interface Qualifier {
  zh: string
  en: string
}

/** 组内差异落在某个 Lab 轴上时，用来区分同名色块的前缀。 */
function qualifierFor(axis: 0 | 1 | 2, delta: number): Qualifier {
  if (axis === 0) return delta < 0 ? { zh: '深', en: 'Deep' } : { zh: '浅', en: 'Light' }
  if (axis === 1) return delta < 0 ? { zh: '偏青', en: 'Greenish' } : { zh: '偏红', en: 'Reddish' }
  return delta < 0 ? { zh: '偏蓝', en: 'Bluish' } : { zh: '偏黄', en: 'Yellowish' }
}

/**
 * 给同一份色卡里重名的色块加前缀，避免用户看到两块都叫"姜黄"。
 * 先找出组内差异最大的 Lab 轴：明暗差得多用"深/浅"，色相差得多用"偏青/偏红"
 * 或"偏黄/偏蓝"——两块同明度的黄，说一个"深"一个"浅"反而是错的。
 */
export function disambiguateColorNames<T extends NamedColor>(entries: T[]): T[] {
  const groups = new Map<string, T[]>()
  for (const entry of entries) {
    const key = `${entry.name.zh}/${entry.name.en}`
    const group = groups.get(key)
    if (group) group.push(entry)
    else groups.set(key, [entry])
  }

  const qualified = new Map<T, ColorName>()
  for (const group of groups.values()) {
    if (group.length < 2) continue

    const labs = group.map((entry) => rgbToLab(entry.rgb))
    const mean = [0, 1, 2].map((axis) => labs.reduce((sum, l) => sum + l[axis], 0) / labs.length)
    const spreads = [0, 1, 2].map(
      (axis) => Math.max(...labs.map((l) => l[axis])) - Math.min(...labs.map((l) => l[axis]))
    )
    const axis = spreads.indexOf(Math.max(...spreads)) as 0 | 1 | 2

    group.forEach((entry, index) => {
      const qualifier = qualifierFor(axis, labs[index][axis] - mean[axis])
      qualified.set(entry, {
        zh: `${qualifier.zh}${entry.name.zh}`,
        en: `${qualifier.en} ${entry.name.en}`,
        rgb: entry.name.rgb,
      })
    })
  }

  // 兜底：万一修饰后仍有同名（例如三块以上撞名且恰好同轴同侧），
  // 用色相表中相邻项的名称补一个可区分的后缀，保证卡上没有两块同名。
  const seen = new Map<string, number>()
  return entries.map((entry) => {
    const name = qualified.get(entry)
    if (!name) return entry
    const count = seen.get(name.zh) ?? 0
    seen.set(name.zh, count + 1)
    if (count === 0) return { ...entry, name }
    return {
      ...entry,
      name: { ...name, zh: `${name.zh}·${count + 1}`, en: `${name.en} ${count + 1}` },
    }
  })
}
