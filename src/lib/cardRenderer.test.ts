import { describe, it, expect, vi } from 'vitest'
import { exportCanvasToBlob, renderCardWithMargin } from './cardRenderer'
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

function renderToNewCanvas(config: CardConfig): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = config.width
  canvas.height = config.height
  renderCardWithMargin(canvas.getContext('2d')!, config, renderClassicStrip)
  return canvas
}

describe('exportCanvasToBlob', () => {
  it('resolves with a PNG blob', async () => {
    const canvas = renderToNewCanvas(makeConfig())
    const blob = await exportCanvasToBlob(canvas)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/png')
  })
})

describe('renderCardWithMargin', () => {
  it('returns a canvas sized to the config dimensions', () => {
    const canvas = renderToNewCanvas(makeConfig())
    expect(canvas.width).toBe(400)
    expect(canvas.height).toBe(500)
  })

  it('insets the template content by marginPx on all sides', () => {
    const config = { ...makeConfig(), marginPx: 40 }
    const canvas = document.createElement('canvas')
    canvas.width = config.width
    canvas.height = config.height
    const ctx = canvas.getContext('2d')!

    renderCardWithMargin(ctx, config, renderClassicStrip)

    const cornerPixel = ctx.getImageData(5, 5, 1, 1).data
    // 经典色带自身背景是 #faf7f2 (250,247,242)；留白区域应显示页面背景色
    // #f9f9f8 (249,249,248)，而不是版式内部绘制的内容——两者数值不同，
    // 足以区分"留白生效"与"留白未生效、版式直接铺满全图"两种情况。
    expect([cornerPixel[0], cornerPixel[1], cornerPixel[2]]).toEqual([249, 249, 248])
  })

  it('draws a HueFrame watermark in the bottom-right corner when enabled', () => {
    const withoutCanvas = document.createElement('canvas')
    withoutCanvas.width = 400
    withoutCanvas.height = 500
    renderCardWithMargin(withoutCanvas.getContext('2d')!, makeConfig(), renderClassicStrip)

    const withCanvas = document.createElement('canvas')
    withCanvas.width = 400
    withCanvas.height = 500
    renderCardWithMargin(withCanvas.getContext('2d')!, { ...makeConfig(), watermarkEnabled: true }, renderClassicStrip)

    const regionWithout = withoutCanvas.getContext('2d')!.getImageData(320, 460, 60, 20).data
    const regionWith = withCanvas.getContext('2d')!.getImageData(320, 460, 60, 20).data

    expect(Array.from(regionWith)).not.toEqual(Array.from(regionWithout))
  })

  it('renders the watermark at a readable size', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 500
    const ctx = canvas.getContext('2d')!
    const fillText = vi.spyOn(ctx, 'fillText')

    renderCardWithMargin(ctx, { ...makeConfig(), watermarkEnabled: true }, renderClassicStrip)

    expect(fillText).toHaveBeenCalledWith('HueFrame', 380, 480)
    expect(ctx.font).toBe('20px Inter, sans-serif')
  })

  it('uses the configured watermark opacity', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 500
    const ctx = canvas.getContext('2d')!

    renderCardWithMargin(
      ctx,
      { ...makeConfig(), watermarkEnabled: true, watermarkOpacity: 0.25 },
      renderClassicStrip
    )

    expect(ctx.fillStyle).toBe('rgba(26, 28, 28, 0.25)')
  })

  it('does not throw when marginPx and watermarkEnabled are omitted', () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 500
    const ctx = canvas.getContext('2d')!
    expect(() => renderCardWithMargin(ctx, makeConfig(), renderClassicStrip)).not.toThrow()
  })
})
