import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LanguagePicker } from './LanguagePicker'

describe('LanguagePicker', () => {
  it('renders both language options with Chinese selected by default', () => {
    render(<LanguagePicker selected="zh" onSelect={vi.fn()} />)
    expect(screen.getByRole('group', { name: '色名语言' })).toBeInTheDocument()
    const zhButton = screen.getByText('中文')
    const enButton = screen.getByText('English')
    expect(zhButton).toBeInTheDocument()
    expect(enButton).toBeInTheDocument()
    expect(zhButton).toHaveAttribute('aria-pressed', 'true')
    expect(zhButton).toHaveClass('h-8', 'min-w-20', 'px-3', 'text-xs')
  })

  it('calls onSelect with "en" when English is clicked', () => {
    const onSelect = vi.fn()
    render(<LanguagePicker selected="zh" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('English'))

    expect(onSelect).toHaveBeenCalledWith('en')
  })
})
