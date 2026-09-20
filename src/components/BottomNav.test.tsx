// src/components/BottomNav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('enables every tool tab now that cropping is implemented', () => {
    render(<BottomNav active="grid" onSelect={vi.fn()} />)
    for (const label of ['卡片', '宫格', '裁剪']) {
      expect(screen.getByText(label)).toBeEnabled()
    }
  })

  it('navigates to the crop tab when it is pressed', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<BottomNav active="grid" onSelect={onSelect} />)
    await user.click(screen.getByText('裁剪'))
    expect(onSelect).toHaveBeenCalledWith('crop')
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
