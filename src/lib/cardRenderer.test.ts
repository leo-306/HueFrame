import { describe, it, expect } from 'vitest'
import { renderCardToCanvas, exportCanvasToBlob } from './cardRenderer'
import type { CardConfig } from '../templates/types'
import { renderClassicStrip } from '../templates/classicStrip'
import { createTestPhoto } from '../../tests/testImage'

function makeConfig(): CardConfig {
  const photo = createTestPhoto(200, 200)
  return {
    photo,
    palette: [
      { rgb: [230, 60, 80], hex: '#e63c50', name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] }, textColor: '#ffffff' },
    ],
    locationName: 'Kyoto, Japan',
    capturedAtText: '2026-04-10',
    titleFont: 'serif',
    width: 400,
    height: 500,
    colorNameLanguage: 'zh',
  }
}

describe('renderCardToCanvas', () => {
  it('returns a canvas sized to the config dimensions', () => {
    const canvas = renderCardToCanvas(makeConfig(), renderClassicStrip)
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(500)
  })
})

describe('exportCanvasToBlob', () => {
  it('resolves with a PNG blob', async () => {
    const canvas = renderCardToCanvas(makeConfig(), renderClassicStrip)
    const blob = await exportCanvasToBlob(canvas)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })
})
