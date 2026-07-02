import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BottomNav } from './BottomNav'

describe('BottomNav', () => {
  it('renders all three tabs', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('卡片')).toBeInTheDocument()
    expect(screen.getByText('宫格')).toBeInTheDocument()
    expect(screen.getByText('裁剪')).toBeInTheDocument()
  })

  it('disables the grid and crop tabs', () => {
    render(<BottomNav active="card" onSelect={vi.fn()} />)
    expect(screen.getByText('宫格')).toBeDisabled()
    expect(screen.getByText('裁剪')).toBeDisabled()
  })

  it('calls onSelect when the enabled card tab is clicked', () => {
    const onSelect = vi.fn()
    render(<BottomNav active="card" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('卡片'))
    expect(onSelect).toHaveBeenCalledWith('card')
  })
})
