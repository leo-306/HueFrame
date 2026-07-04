// src/components/BottomNav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders all four tabs', () => {
    render(<BottomNav active="home" onSelect={vi.fn()} />)
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('卡片')).toBeInTheDocument()
    expect(screen.getByText('宫格')).toBeInTheDocument()
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('disables the crop tab but not the home, card, or grid tabs', () => {
    render(<BottomNav active="home" onSelect={vi.fn()} />)
    expect(screen.getByText('裁剪')).toBeDisabled()
    expect(screen.getByText('首页')).not.toBeDisabled()
    expect(screen.getByText('卡片')).not.toBeDisabled()
    expect(screen.getByText('宫格')).not.toBeDisabled()
  })

  it('marks the active tab as selected via ARIA state', () => {
    render(<BottomNav active="home" onSelect={vi.fn()} />)
    expect(screen.getByText('首页')).toHaveAttribute('aria-selected', 'true')
  })
})
