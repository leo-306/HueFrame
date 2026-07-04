import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UiLanguagePicker } from './UiLanguagePicker'

describe('UiLanguagePicker', () => {
  it('uses a fixed-width button so locale labels do not shift the header', () => {
    render(<UiLanguagePicker />)
    expect(screen.getByRole('button', { name: '切换界面语言' })).toHaveClass('w-16')
  })
})
