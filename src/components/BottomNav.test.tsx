// src/components/BottomNav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders tool tabs without a home tab', () => {
    render(<BottomNav active="grid" onSelect={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: '工具导航' })).toHaveClass('fixed', 'bottom-0')
    expect(screen.queryByText('首页')).not.toBeInTheDocument()
    expect(screen.getByText('卡片')).toBeInTheDocument()
    expect(screen.getByText('宫格')).toBeInTheDocument()
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('disables the crop tab but not the card or grid tabs', () => {
    render(<BottomNav active="grid" onSelect={vi.fn()} />)
    expect(screen.getByText('裁剪')).toBeDisabled()
    expect(screen.getByText('卡片')).not.toBeDisabled()
    expect(screen.getByText('宫格')).not.toBeDisabled()
  })

  it('marks the active tab as selected via ARIA state', () => {
    render(<BottomNav active="grid" onSelect={vi.fn()} />)
    const activeTab = screen.getByText('宫格').closest('button')
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
    expect(activeTab).toHaveAttribute('data-state', 'active')
    expect(activeTab).toHaveClass('data-[state=active]:bg-primary-container/70')
  })

  it('renders an icon for every tool tab', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('卡片').closest('button')?.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('宫格').closest('button')?.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('裁剪').closest('button')?.querySelector('svg')).toBeInTheDocument()
  })
})
