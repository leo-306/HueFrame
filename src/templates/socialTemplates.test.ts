import { describe, expect, it, vi } from 'vitest'
import { createTestPhoto } from '../../tests/testImage'
import type { CardConfig, TemplateRenderer } from './types'
import { renderEditorialFrame } from './editorialFrame'
import { renderPolaroidJournal } from './polaroidJournal'
import { renderColorArchive } from './colorArchive'
import { renderPantoneCard } from './pantoneCard'
import { renderColorAnnotation } from './colorAnnotation'
import { renderDesignerSpec } from './designerSpec'
import { renderHeroHex } from './heroHex'
import { renderBandList } from './bandList'

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
  ['designer spec', renderDesignerSpec],
  ['hero hex', renderHeroHex],
  ['band list', renderBandList],
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

describe('designer spec multi-format output', () => {
  function renderWithFormat(format: 'hex' | 'rgb' | 'hsl') {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const texts: string[] = []
    vi.spyOn(ctx, 'fillText').mockImplementation((text) => {
      texts.push(String(text))
    })
    const config = { ...makeConfig(), colorFormat: format }
    renderDesignerSpec(ctx, config)
    return texts
  }

  it('shows the primary format plus the other two for each swatch', () => {
    const texts = renderWithFormat('rgb')
    // 主色值 rgb(196, 90, 67) 出现，另外两种格式也一并补充
    expect(texts).toContain('rgb(196, 90, 67)')
    expect(texts.some((t) => t.includes('#C45A43'))).toBe(true)
    expect(texts.some((t) => /hsl\(/.test(t))).toBe(true)
  })

  it('renders hex as the primary value when that format is selected', () => {
    const texts = renderWithFormat('hex')
    expect(texts).toContain('#C45A43')
  })

  it('always prints a WCAG contrast readout per swatch', () => {
    const texts = renderWithFormat('hex')
    const contrastLines = texts.filter((t) => t.startsWith('对比'))
    expect(contrastLines.length).toBeGreaterThan(0)
    expect(contrastLines[0]).toMatch(/^对比 \d+\.\d$/)
  })
})

describe('hero hex template', () => {
  function render(format: 'hex' | 'rgb' | 'hsl') {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const texts: string[] = []
    vi.spyOn(ctx, 'fillText').mockImplementation((t) => { texts.push(String(t)) })
    renderHeroHex(ctx, { ...makeConfig(), colorFormat: format })
    return texts
  }

  it('features the dominant color value prominently', () => {
    const texts = render('hex')
    expect(texts).toContain('#C45A43')
    expect(texts.some((t) => t.includes('陶红'))).toBe(true)
  })

  it('switches the hero value to the chosen format', () => {
    expect(render('rgb')).toContain('rgb(196, 90, 67)')
  })
})

describe('band list template', () => {
  function render(format: 'hex' | 'rgb' | 'hsl') {
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 1000
    const ctx = canvas.getContext('2d')!
    const texts: string[] = []
    vi.spyOn(ctx, 'fillText').mockImplementation((t) => { texts.push(String(t)) })
    renderBandList(ctx, { ...makeConfig(), colorFormat: format })
    return texts
  }

  it('labels every swatch with its name and value', () => {
    const texts = render('hex')
    expect(texts).toContain('陶红')
    expect(texts).toContain('#C45A43')
    expect(texts.some((t) => t.includes('%'))).toBe(true)
  })

  it('renders the selected format on the bands', () => {
    expect(render('rgb')).toContain('rgb(196, 90, 67)')
  })
})
