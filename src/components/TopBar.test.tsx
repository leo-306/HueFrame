import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders the HueFrame title', () => {
    render(<TopBar language="zh" onLanguageChange={vi.fn()} />)
    expect(screen.getByText('HueFrame')).toBeInTheDocument()
  })

  it('forwards language selection via onLanguageChange', () => {
    const onLanguageChange = vi.fn()
    render(<TopBar language="zh" onLanguageChange={onLanguageChange} />)
    fireEvent.click(screen.getByText('English'))
    expect(onLanguageChange).toHaveBeenCalledWith('en')
  })
})
