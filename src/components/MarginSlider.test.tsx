import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MarginSlider } from './MarginSlider'

describe('MarginSlider', () => {
  it('displays the current margin value', () => {
    render(<MarginSlider valuePx={24} onChange={vi.fn()} />)
    expect(screen.getByText('24px')).toBeInTheDocument()
  })

  it('calls onChange with the new numeric value when moved', () => {
    const onChange = vi.fn()
    render(<MarginSlider valuePx={24} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '48' } })
    expect(onChange).toHaveBeenCalledWith(48)
  })
})
