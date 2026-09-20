import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { PaletteControls } from './PaletteControls'

describe('PaletteControls', () => {
  it('renders re-extraction and spacing controls with their current values', () => {
    render(
      <PaletteControls
        marginPx={24}
        swatchGapPx={16}
        swatchRadiusPx={6}
        paletteSize={6}
        onReextract={vi.fn()}
        onMarginChange={vi.fn()}
        onSwatchGapChange={vi.fn()}
        onSwatchRadiusChange={vi.fn()}
        onPaletteSizeChange={vi.fn()}
      >
        <div>颜色列表</div>
      </PaletteControls>
    )

    expect(screen.getByRole('button', { name: '从图片重新提取' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: '卡片内边距' })).toHaveValue(24)
    expect(screen.getByRole('spinbutton', { name: '色块间距' })).toHaveValue(16)
    expect(screen.getByRole('spinbutton', { name: '色块圆角' })).toHaveValue(6)
    expect(screen.getByText('颜色列表')).toBeInTheDocument()
  })

  it('dispatches re-extraction and stepper changes', () => {
    const onReextract = vi.fn()
    const onMarginChange = vi.fn()
    const onSwatchGapChange = vi.fn()
    const onPaletteSizeChange = vi.fn()
    render(
      <PaletteControls
        marginPx={24}
        swatchGapPx={16}
        swatchRadiusPx={6}
        paletteSize={6}
        onReextract={onReextract}
        onMarginChange={onMarginChange}
        onSwatchGapChange={onSwatchGapChange}
        onSwatchRadiusChange={vi.fn()}
        onPaletteSizeChange={onPaletteSizeChange}
      >
        <div />
      </PaletteControls>
    )

    fireEvent.click(screen.getByRole('button', { name: '从图片重新提取' }))
    fireEvent.click(screen.getByRole('button', { name: '增加卡片内边距' }))
    fireEvent.click(screen.getByRole('button', { name: '减少色块间距' }))
    fireEvent.change(screen.getByRole('spinbutton', { name: '色块间距' }), { target: { value: '20' } })

    expect(onReextract).toHaveBeenCalledOnce()
    expect(onMarginChange).toHaveBeenCalledWith(25)
    expect(onSwatchGapChange).toHaveBeenNthCalledWith(1, 15)
    expect(onSwatchGapChange).toHaveBeenNthCalledWith(2, 20)
  })

  it('disables re-extraction while colors are being extracted', () => {
    render(
      <PaletteControls
        marginPx={24}
        swatchGapPx={16}
        swatchRadiusPx={6}
        paletteSize={6}
        isExtracting
        onReextract={vi.fn()}
        onMarginChange={vi.fn()}
        onSwatchGapChange={vi.fn()}
        onSwatchRadiusChange={vi.fn()}
        onPaletteSizeChange={vi.fn()}
      >
        <div />
      </PaletteControls>
    )

    expect(screen.getByRole('button', { name: '正在重新提取' })).toBeDisabled()
  })
})

describe('PaletteControls 色块数量', () => {
  it('shows the swatch-count stepper clamped to 3–9', () => {
    render(
      <PaletteControls
        marginPx={24}
        swatchGapPx={16}
        swatchRadiusPx={6}
        paletteSize={6}
        onReextract={vi.fn()}
        onMarginChange={vi.fn()}
        onSwatchGapChange={vi.fn()}
        onSwatchRadiusChange={vi.fn()}
        onPaletteSizeChange={vi.fn()}
      >
        <div />
      </PaletteControls>
    )
    const stepper = screen.getByRole('spinbutton', { name: '色块数量' })
    expect(stepper).toHaveValue(6)
    expect(stepper).toHaveAttribute('min', '3')
    expect(stepper).toHaveAttribute('max', '9')
  })

  it('dispatches swatch-count changes', () => {
    const onPaletteSizeChange = vi.fn()
    render(
      <PaletteControls
        marginPx={24}
        swatchGapPx={16}
        swatchRadiusPx={6}
        paletteSize={6}
        onReextract={vi.fn()}
        onMarginChange={vi.fn()}
        onSwatchGapChange={vi.fn()}
        onSwatchRadiusChange={vi.fn()}
        onPaletteSizeChange={onPaletteSizeChange}
      >
        <div />
      </PaletteControls>
    )
    fireEvent.click(screen.getByRole('button', { name: '增加色块数量' }))
    expect(onPaletteSizeChange).toHaveBeenCalledWith(7)
  })
})
