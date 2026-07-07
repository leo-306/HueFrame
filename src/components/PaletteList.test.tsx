import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaletteList } from './PaletteList'
import type { PaletteEntry } from '../templates/types'

function makePalette(): PaletteEntry[] {
  return [
    {
      rgb: [230, 60, 80],
      hex: '#e63c50',
      name: { zh: '绯樱', en: 'Cherry Blush', rgb: [230, 60, 80] },
      textColor: '#ffffff',
      percentage: 60,
    },
    {
      rgb: [40, 160, 160],
      hex: '#28a0a0',
      name: { zh: '青碧', en: 'Cyan Jade', rgb: [40, 160, 160] },
      textColor: '#ffffff',
      percentage: 40,
    },
  ]
}

describe('PaletteList', () => {
  it('renders name, hex, and percentage for each color in Chinese by default', () => {
    render(<PaletteList palette={makePalette()} language="zh" onColorChange={vi.fn()} onMove={vi.fn()} />)
    expect(screen.getByText('绯樱')).toBeInTheDocument()
    expect(screen.getByText('#E63C50')).toBeInTheDocument()
    expect(screen.getByText('占比 60%')).toBeInTheDocument()
  })

  it('renders English color names when language is "en"', () => {
    render(<PaletteList palette={makePalette()} language="en" onColorChange={vi.fn()} onMove={vi.fn()} />)
    expect(screen.getByText('Cherry Blush')).toBeInTheDocument()
  })

  it('calls onColorChange with the swatch index and new hex when a color input changes', () => {
    const onColorChange = vi.fn()
    render(<PaletteList palette={makePalette()} language="zh" onColorChange={onColorChange} onMove={vi.fn()} />)

    const firstSwatch = screen.getByLabelText('edit-color-0')
    fireEvent.change(firstSwatch, { target: { value: '#123456' } })

    expect(onColorChange).toHaveBeenCalledWith(0, '#123456')
  })

  it('moves a color up or down', () => {
    const onMove = vi.fn()
    render(<PaletteList palette={makePalette()} language="zh" onColorChange={vi.fn()} onMove={onMove} />)

    expect(screen.getByRole('button', { name: '上移 绯樱' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: '下移 绯樱' }))
    fireEvent.click(screen.getByRole('button', { name: '上移 青碧' }))

    expect(onMove).toHaveBeenNthCalledWith(1, 0, 'down')
    expect(onMove).toHaveBeenNthCalledWith(2, 1, 'up')
  })
})
