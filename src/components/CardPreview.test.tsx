import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CardPreview } from './CardPreview'
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

describe('CardPreview', () => {
  it('renders a canvas element sized to the config', () => {
    const { container } = render(<CardPreview config={makeConfig()} renderer={renderClassicStrip} />)
    const canvas = container.querySelector('canvas')
    expect(canvas).not.toBeNull()
    expect(canvas?.width).toBe(400)
    expect(canvas?.height).toBe(500)
  })
})
