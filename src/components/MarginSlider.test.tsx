import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarginSlider } from './MarginSlider'

describe('MarginSlider', () => {
  it('displays the current margin value', () => {
    render(<MarginSlider valuePx={24} onChange={vi.fn()} />)
    expect(screen.getByText('24px')).toBeInTheDocument()
  })

  it('calls onChange with the new numeric value when moved', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()
    render(<MarginSlider valuePx={24} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    slider.focus()
    await user.keyboard('[ArrowRight]')
    expect(onChange).toHaveBeenCalledWith(25)
  })
})
