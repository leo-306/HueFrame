import { describe, it, expect } from 'vitest'
import { renderClassicStrip } from './classicStrip'
import type { CardConfig } from './types'
import { createTestPhoto } from '../../tests/testImage'

function makeConfig(): CardConfig {
  const photo = createTestPhoto(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
      { rgb: [40, 160, 160], hex: '#28a0a0', name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] }, textColor: '#ffffff' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 800,
    height: 1000,
    colorNameLanguage: 'zh',
  }
}

describe('renderClassicStrip', () => {
  it('draws without throwing and fills the canvas background', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    expect(() => renderClassicStrip(ctx, makeConfig())).not.toThrow()

    const pixel = ctx.getImageData(10, 10, 1, 1).data
    // 背景不应保持透明/全零
    expect(pixel[3]).toBeGreaterThan(0)
  })

  it('does not throw when colorNameLanguage is "en"', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const config = { ...makeConfig(), colorNameLanguage: 'en' as const }

    expect(() => renderClassicStrip(ctx, config)).not.toThrow()
  })
})
