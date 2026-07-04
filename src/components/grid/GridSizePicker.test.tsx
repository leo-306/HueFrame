import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GridSizePicker } from './GridSizePicker'

describe('GridSizePicker', () => {
  it('renders all three preset buttons', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)
    expect(screen.getByText('3×3')).toBeInTheDocument()
    expect(screen.getByText('2×2')).toBeInTheDocument()
    expect(screen.getByText('1×3')).toBeInTheDocument()
  })

  it('calls onChange with the preset rows/cols when a preset is clicked', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.click(screen.getByText('2×2'))

    expect(onChange).toHaveBeenCalledWith({ rows: 2, cols: 2 })
  })

  it('calls onChange with a clamped value when the custom rows input changes', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '9' } })

    expect(onChange).toHaveBeenCalledWith({ rows: 6, cols: 3 })
  })

  it('calls onChange with a clamped value when the custom cols input changes', () => {
    const onChange = vi.fn()
    render(<GridSizePicker rows={3} cols={3} onChange={onChange} />)

    fireEvent.change(screen.getByLabelText('自定义列数'), { target: { value: '0' } })

    expect(onChange).toHaveBeenCalledWith({ rows: 3, cols: 1 })
  })

  it('shows a clamp hint when an out-of-range custom value is entered', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '9' } })

    expect(screen.getByText('已调整为 1-6 之间')).toBeInTheDocument()
  })

  it('does not show a clamp hint when a value within range is entered', () => {
    render(<GridSizePicker rows={3} cols={3} onChange={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('自定义行数'), { target: { value: '4' } })

    expect(screen.queryByText('已调整为 1-6 之间')).not.toBeInTheDocument()
  })
})
