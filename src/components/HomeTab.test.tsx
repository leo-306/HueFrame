import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HomeTab } from './HomeTab'

describe('HomeTab', () => {
  it('renders the hero headline and subheadline', () => {
    render(<HomeTab onSelectCard={vi.fn()} onSelectGrid={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '给照片，配一套颜色' })).toBeInTheDocument()
    expect(screen.getByText(/极简的照片色卡与切分工具/)).toBeInTheDocument()
  })

  it('renders both mode entry cards with their descriptions', () => {
    render(<HomeTab onSelectCard={vi.fn()} onSelectGrid={vi.fn()} />)
    expect(screen.getByRole('button', { name: /色卡模式/ })).toHaveStyle({
      backgroundImage: "url('/images/home-palette-bg.jpg')",
    })
    expect(screen.getByText(/提取主色调，生成精致色卡/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /切分模式/ })).toHaveStyle({
      backgroundImage: "url('/images/home-grid-bg.jpg')",
    })
    expect(screen.getByText(/九宫格切分，支持自定义间距/)).toBeInTheDocument()
  })

  it('renders all three feature descriptions', () => {
    render(<HomeTab onSelectCard={vi.fn()} onSelectGrid={vi.fn()} />)
    expect(screen.getByText('本地解析')).toBeInTheDocument()
    expect(screen.getByText('极致清新')).toBeInTheDocument()
    expect(screen.getByText('快速导出')).toBeInTheDocument()
  })

  it('switches to the card tool without opening a file input', () => {
    const onSelectCard = vi.fn()
    render(<HomeTab onSelectCard={onSelectCard} onSelectGrid={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /色卡模式/ }))
    expect(onSelectCard).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('home-card-upload-input')).not.toBeInTheDocument()
  })

  it('switches to the grid tool without opening a file input', () => {
    const onSelectGrid = vi.fn()
    render(<HomeTab onSelectCard={vi.fn()} onSelectGrid={onSelectGrid} />)
    fireEvent.click(screen.getByRole('button', { name: /切分模式/ }))
    expect(onSelectGrid).toHaveBeenCalledOnce()
    expect(screen.queryByTestId('home-grid-upload-input')).not.toBeInTheDocument()
  })
})
