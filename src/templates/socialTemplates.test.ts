import { describe, expect, it, vi } from 'vitest'
import { createTestPhoto } from '../../tests/testImage'
import type { CardConfig, TemplateRenderer } from './types'
import { renderEditorialFrame } from './editorialFrame'
import { renderPolaroidJournal } from './polaroidJournal'
import { renderColorArchive } from './colorArchive'
import { renderPantoneCard } from './pantoneCard'
import { renderColorAnnotation } from './colorAnnotation'

function makeConfig(): CardConfig {
  return {
    photo: createTestPhoto(300, 200),
    palette: [
      { rgb: [196, 90, 67], hex: '#c45a43', name: { zh: '陶红', en: 'Terracotta', rgb: [196, 90, 67] }, textColor: '#ffffff', percentage: 42 },
      { rgb: [90, 120, 105], hex: '#5a7869', name: { zh: '松绿', en: 'Pine Green', rgb: [90, 120, 105] }, textColor: '#ffffff', percentage: 28 },
      { rgb: [229, 216, 188], hex: '#e5d8bc', name: { zh: '燕麦', en: 'Oat', rgb: [229, 216, 188] }, textColor: '#000000', percentage: 18 },
    ],
    locationName: 'Dali, Yunnan',
    capturedAtText: '2026.08.02',
    titleFont: 'Georgia, serif',
    width: 800,
    height: 1000,
    colorNameLanguage: 'zh',
  }
}

const templates: Array<[string, TemplateRenderer]> = [
  ['editorial frame', renderEditorialFrame],
  ['polaroid journal', renderPolaroidJournal],
  ['color archive', renderColorArchive],
  ['pantone card', renderPantoneCard],
  ['color annotation', renderColorAnnotation],
]

describe.each(templates)('%s template', (_name, renderer) => {
  it('renders the photo, palette, and metadata without throwing', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const drawImage = vi.spyOn(ctx, 'drawImage')
    const fillText = vi.spyOn(ctx, 'fillText')

    expect(() => renderer(ctx, makeConfig())).not.toThrow()
    expect(drawImage).toHaveBeenCalled()
    expect(fillText.mock.calls.some(([text]) => String(text).toLowerCase().includes('dali'))).toBe(true)
    expect(ctx.getImageData(2, 2, 1, 1).data[3]).toBeGreaterThan(0)
  })
})

describe('social template safeguards', () => {
  it('keeps a portrait source fully visible in the Pantone photo slot', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const config = makeConfig()
    config.photo = createTestPhoto(300, 600)
    const drawImage = vi.spyOn(ctx, 'drawImage')
    const strokeRect = vi.spyOn(ctx, 'strokeRect')

    renderPantoneCard(ctx, config)

    const photoCall = drawImage.mock.calls.find(([source]) => source === config.photo)
    expect(photoCall).toHaveLength(5)
    expect(strokeRect).toHaveBeenCalled()
  })

  it('draws a two-tone connector underneath each annotation line', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const stroke = vi.spyOn(ctx, 'stroke')

    renderColorAnnotation(ctx, makeConfig())

    expect(stroke.mock.calls.length).toBeGreaterThanOrEqual(9)
  })
})
