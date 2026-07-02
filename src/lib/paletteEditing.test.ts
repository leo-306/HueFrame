import { describe, it, expect } from 'vitest'
import { updatePaletteEntryColor } from './paletteEditing'
import type { PaletteEntry } from '../templates/types'

function makeEntry(): PaletteEntry {
  return {
    rgb: [230, 60, 80],
    hex: '#e63c50',
    name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
    textColor: '#ffffff',
    percentage: 40,
  }
}

describe('updatePaletteEntryColor', () => {
  it('replaces rgb and hex with the new color', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.hex).toBe('#1e3ca0')
    expect(updated.rgb).toEqual([30, 60, 160])
  })

  it('recomputes the nearest color name for the new color', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.name.zh).not.toBe('绯樱')
  })

  it('recomputes the readable text color for the new background', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#141d1a')
    expect(updated.textColor).toBe('#ffffff')
  })

  it('preserves the original percentage', () => {
    const updated = updatePaletteEntryColor(makeEntry(), '#1e3ca0')
    expect(updated.percentage).toBe(40)
  })
})
