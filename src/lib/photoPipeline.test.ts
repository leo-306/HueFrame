import { describe, it, expect, vi } from 'vitest'
import { buildCardConfig } from './photoPipeline'

vi.mock('./exifParser', () => ({
  parsePhotoMeta: vi.fn().mockResolvedValue({
    gps: { lat: 35.0116, lon: 135.7681 },
    capturedAt: new Date('2026-04-10T09:30:00'),
  }),
}))

vi.mock('./geocoding', () => ({
  resolveLocationName: vi.fn().mockResolvedValue('Kyoto, Japan'),
}))

vi.mock('./colorExtraction', () => ({
  extractPalette: vi.fn().mockResolvedValue([
    [230, 60, 80],
    [40, 160, 160],
  ]),
}))

vi.mock('./paletteWeights', () => ({
  computePalettePercentages: vi.fn().mockReturnValue([60, 40]),
}))

describe('buildCardConfig', () => {
  it('assembles a complete CardConfig from a photo image', async () => {
    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'zh',
    })

    expect(config.locationName).toBe('Kyoto, Japan')
    expect(config.capturedAtText).toContain('2026')
    expect(config.palette.length).toBe(2)
    expect(config.palette[0].hex).toMatch(/^#[0-9a-f]{6}$/i)
    expect(config.palette[0].percentage).toBe(60)
    expect(config.palette[1].percentage).toBe(40)
    expect(config.width).toBe(800)
    expect(config.height).toBe(1000)
    expect(config.colorNameLanguage).toBe('zh')
  })

  it('falls back to coordinate-derived location text when GPS is missing', async () => {
    const { parsePhotoMeta } = await import('./exifParser')
    vi.mocked(parsePhotoMeta).mockResolvedValueOnce({ gps: null, capturedAt: null })

    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'zh',
    })

    expect(config.locationName).toBe('未知地点')
    expect(config.capturedAtText).toBe('')
  })

  it('passes through colorNameLanguage "en" unchanged', async () => {
    const photo = new Image(200, 200)
    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })

    const config = await buildCardConfig(file, photo, {
      width: 800,
      height: 1000,
      titleFont: 'serif',
      colorNameLanguage: 'en',
    })

    expect(config.colorNameLanguage).toBe('en')
  })
})
