import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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

  it('provides previous, next, and all-template controls', () => {
    const onPreviousTemplate = vi.fn()
    const onNextTemplate = vi.fn()
    const onShowAllTemplates = vi.fn()
    render(
      <CardPreview
        config={makeConfig()}
        renderer={renderClassicStrip}
        templateName="经典色带"
        isMock
        onPreviousTemplate={onPreviousTemplate}
        onNextTemplate={onNextTemplate}
        onShowAllTemplates={onShowAllTemplates}
      />
    )

    const controls = screen.getByTestId('template-controls')
    fireEvent.click(within(controls).getByRole('button', { name: '上一个模板' }))
    fireEvent.click(within(controls).getByRole('button', { name: '下一个模板' }))
    fireEvent.click(within(controls).getByRole('button', { name: '查看全部模板' }))

    expect(onPreviousTemplate).toHaveBeenCalledOnce()
    expect(onNextTemplate).toHaveBeenCalledOnce()
    expect(onShowAllTemplates).toHaveBeenCalledOnce()
    expect(screen.getByText('经典色带')).toBeInTheDocument()
    expect(screen.getByText('MOCK')).toBeInTheDocument()
  })
})
