import { describe, it, expect } from 'vitest'
import { renderMagazineCover } from './magazineCover'
import type { CardConfig } from './types'
import { createTestPhoto } from '../../tests/testImage'

function makeConfig(): CardConfig {
  const photo = createTestPhoto(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
      { rgb: [40, 160, 160], hex: '#28a0a0', name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] }, textColor: '#ffffff' },
      { rgb: [220, 170, 30], hex: '#dcaa1e', name: { zh: '姜黄', en: 'Turmeric', rgb: [220, 170, 30] }, textColor: '#000000' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 800,
    height: 1000,
    colorNameLanguage: 'zh',
  }
}

describe('renderMagazineCover', () => {
  it('draws without throwing and covers the full canvas with the photo', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!

    expect(() => renderMagazineCover(ctx, makeConfig())).not.toThrow()

    const pixel = ctx.getImageData(400, 500, 1, 1).data
    expect(pixel[3]).toBeGreaterThan(0)
  })
})
