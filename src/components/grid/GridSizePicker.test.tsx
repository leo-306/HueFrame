import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridSizePicker } from './GridSizePicker'

describe('GridSizePicker', () => {
  it('renders all common preset buttons as grid icons', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: '3×3' })).toHaveClass('bg-primary-container/70', 'text-primary')
    expect(screen.getByRole('button', { name: '2×2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2×3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3×2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1×3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3×1' })).toBeInTheDocument()
    expect(screen.queryByText('3×3')).not.toBeInTheDocument()
  })

  it('keeps custom rows and columns collapsed by default', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    expect(screen.queryByLabelText('自定义行数')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    expect(screen.getByRole('slider', { name: '自定义行数' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: '自定义列数' })).toBeInTheDocument()
  })

  it('calls onChange with the preset rows/cols when a preset is clicked', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2×2' }))

    expect(onChange).toHaveBeenCalledWith({ rows: 2, cols: 2 })
  })

  it('uses sliders with a range from 1 to 10 for custom rows and columns', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))

    for (const slider of screen.getAllByRole('slider')) {
      expect(slider).toHaveAttribute('aria-valuemin', '1')
      expect(slider).toHaveAttribute('aria-valuemax', '10')
    }
  })

  it('calls onChange when the custom rows slider changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    const rowsSlider = screen.getByRole('slider', { name: '自定义行数' })
    rowsSlider.focus()
    await user.keyboard('[ArrowRight]')

    expect(onChange).toHaveBeenCalledWith({ rows: 4, cols: 3 })
  })

  it('calls onChange when the custom columns slider changes', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    const colsSlider = screen.getByRole('slider', { name: '自定义列数' })
    colsSlider.focus()
    await user.keyboard('[ArrowLeft]')

    expect(onChange).toHaveBeenCalledWith({ rows: 3, cols: 2 })
  })
})
