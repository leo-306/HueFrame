import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders all three tabs', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('卡片')).toBeInTheDocument()
    expect(screen.getByText('宫格')).toBeInTheDocument()
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('disables the crop tab but not the grid tab', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('裁剪')).toBeDisabled()
    expect(screen.getByText('宫格')).not.toBeDisabled()
  })

  it('marks the active tab as selected via ARIA state', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('卡片')).toHaveAttribute('aria-selected', 'true')
  })
})
