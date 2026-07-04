import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HomeTab } from './HomeTab'

describe('HomeTab', () => {
  it('renders the hero headline and subheadline', () => {
    render(<HomeTab onSelectCardPhoto={vi.fn()} onSelectGridPhoto={vi.fn()} />)
    expect(screen.getByText('给照片，配一套颜色。')).toBeInTheDocument()
    expect(screen.getByText(/极简的照片色卡与切分工具/)).toBeInTheDocument()
  })

  it('renders both mode entry cards with their descriptions', () => {
    render(<HomeTab onSelectCardPhoto={vi.fn()} onSelectGridPhoto={vi.fn()} />)
    expect(screen.getByText('色卡模式')).toBeInTheDocument()
    expect(screen.getByText(/提取主色调，生成精致色卡/)).toBeInTheDocument()
    expect(screen.getByText('切分模式')).toBeInTheDocument()
    expect(screen.getByText(/九宫格切分，支持自定义间距/)).toBeInTheDocument()
  })

  it('renders all three feature descriptions', () => {
    render(<HomeTab onSelectCardPhoto={vi.fn()} onSelectGridPhoto={vi.fn()} />)
    expect(screen.getByText('本地解析')).toBeInTheDocument()
    expect(screen.getByText('极致清新')).toBeInTheDocument()
    expect(screen.getByText('快速导出')).toBeInTheDocument()
  })

  it('calls onSelectCardPhoto when a file is chosen via the 色卡模式 card', () => {
    const onSelectCardPhoto = vi.fn()
    render(<HomeTab onSelectCardPhoto={onSelectCardPhoto} onSelectGridPhoto={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('home-card-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onSelectCardPhoto).toHaveBeenCalledWith(file)
  })

  it('calls onSelectGridPhoto when a file is chosen via the 切分模式 card', () => {
    const onSelectGridPhoto = vi.fn()
    render(<HomeTab onSelectCardPhoto={vi.fn()} onSelectGridPhoto={onSelectGridPhoto} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('home-grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onSelectGridPhoto).toHaveBeenCalledWith(file)
  })
})
