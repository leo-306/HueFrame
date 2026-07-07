import { describe, it, expect, vi } from 'vitest'
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

  it('draws the photo at its original aspect ratio', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const config = { ...makeConfig(), photo: createTestPhoto(300, 200), width: 800, height: 933 }
    const drawImage = vi.spyOn(ctx, 'drawImage')

    renderClassicStrip(ctx, config)

    expect(drawImage).toHaveBeenCalledWith(config.photo, 0, 0, 800, 533)
  })

  it('uses readable typography for swatch labels and photo information', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const renderedText: Array<{ text: string; font: string }> = []
    vi.spyOn(ctx, 'fillText').mockImplementation((text) => {
      renderedText.push({ text: String(text), font: ctx.font })
    })

    renderClassicStrip(ctx, makeConfig())

    expect(renderedText.find(({ text }) => text === '绯樱')?.font).toBe('24px sans-serif')
    expect(renderedText.find(({ text }) => text === '#E63C50')?.font).toBe('16px monospace')
    expect(renderedText.find(({ text }) => text.includes('Kyoto, Japan'))?.font).toContain('LXGW WenKai')
  })

  it('centers the swatch name and hex vertically like the reference layout', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fillText = vi.spyOn(ctx, 'fillText')

    renderClassicStrip(ctx, makeConfig())

    expect(fillText).toHaveBeenCalledWith('绯樱', 200, 935)
    expect(fillText).toHaveBeenCalledWith('#E63C50', 200, 977)
  })

  it('omits the separator when capture time is unavailable', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fillText = vi.spyOn(ctx, 'fillText')

    renderClassicStrip(ctx, { ...makeConfig(), capturedAtText: '' })

    expect(fillText).toHaveBeenCalledWith('Kyoto, Japan', 400, 968)
  })

  it('applies configured gaps and rounded corners to palette swatches', () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const roundRect = vi.spyOn(ctx, 'roundRect')

    renderClassicStrip(ctx, { ...makeConfig(), swatchGapPx: 16, swatchRadiusPx: 6 })

    expect(roundRect).toHaveBeenNthCalledWith(1, 0, 800, 392, 300, 6)
    expect(roundRect).toHaveBeenNthCalledWith(2, 408, 800, 392, 300, 6)
  })
})
