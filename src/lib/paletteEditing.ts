import { hexToRgb } from './colorMath'
import { nearestColorName } from './colorNames'
import { pickReadableTextColor } from './contrastColor'
import type { PaletteEntry } from '../templates/types'

/**
 * 用户在调色 Tab 手动微调某个色块时调用：只替换这一个色块的颜色，
 * 保留原有占比不变，并重新计算色名与可读文字色。
 */
export function updatePaletteEntryColor(entry: PaletteEntry, newHex: string): PaletteEntry {
  const rgb = hexToRgb(newHex)
  return {
    ...entry,
    rgb,
    hex: newHex.toLowerCase(),
    name: nearestColorName(rgb),
    textColor: pickReadableTextColor(rgb),
  }
}
