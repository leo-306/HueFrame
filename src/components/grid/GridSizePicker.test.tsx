import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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
    expect(screen.getByLabelText('自定义行数')).toBeInTheDocument()
    expect(screen.getByLabelText('自定义列数')).toBeInTheDocument()
  })

  it('calls onChange with the preset rows/cols when a preset is clicked', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2×2' }))

    expect(onChange).toHaveBeenCalledWith({ rows: 2, cols: 2 })
  })

  it('calls onChange with a clamped value when the custom rows input changes', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '9' } })

    expect(onChange).toHaveBeenCalledWith({ rows: 6, cols: 3 })
  })

  it('calls onChange with a clamped value when the custom cols input changes', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    fireEvent.change(screen.getByLabelText('自定义列数'), { target: { value: '0' } })

    expect(onChange).toHaveBeenCalledWith({ rows: 3, cols: 1 })
  })

  it('shows a clamp hint when an out-of-range custom value is entered', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '9' } })

    expect(screen.getByText('已调整为 1-6 之间')).toBeInTheDocument()
  })

  it('does not show a clamp hint when a value within range is entered', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '高级设置' }))
    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '4' } })

    expect(screen.queryByText('已调整为 1-6 之间')).not.toBeInTheDocument()
  })
})
