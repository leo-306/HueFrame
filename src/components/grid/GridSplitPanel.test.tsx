import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GridSplitPanel } from './GridSplitPanel'
import { installMockUploadImage } from '../../../tests/mockUploadImage'

describe('GridSplitPanel', () => {
  let restoreMockImage: () => void

  beforeEach(() => {
    restoreMockImage = installMockUploadImage()
  })

  afterEach(() => {
    restoreMockImage()
  })

  it('shows the upload zone before any photo is selected', () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
  })

  it('loads initialFile as the current photo when provided', async () => {
    const file = new File(['dummy'], 'from-home.jpg', { type: 'image/jpeg' })
    render(<GridSplitPanel onGenerateCard={vi.fn()} initialFile={file} />)

    await waitFor(() => expect(screen.getByText('3×3')).toBeInTheDocument())
    expect(screen.queryByTestId('upload-input')).not.toBeInTheDocument()
  })

  it('does not show the grid size picker when initialFile is not provided', () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} />)
    expect(screen.queryByText('3×3')).not.toBeInTheDocument()
  })

  it('shows the grid size picker and export button after a photo is uploaded', async () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText('3×3')).toBeInTheDocument())
    expect(screen.getByText('导出图片')).toBeInTheDocument()
    expect(screen.getByText('生成色卡')).toBeInTheDocument()
  })

  it('renders exactly two canvases: a preview canvas and a hidden export canvas', async () => {
    const { container } = render(<GridSplitPanel onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(container.querySelectorAll('canvas')).toHaveLength(2))
  })

  it('disables the generate-card button until export canvas is ready, then calls onGenerateCard when clicked', async () => {
    const onGenerateCard = vi.fn()
    render(<GridSplitPanel onGenerateCard={onGenerateCard} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText('生成色卡')).not.toBeDisabled())
    fireEvent.click(screen.getByText('生成色卡'))

    expect(onGenerateCard).toHaveBeenCalledTimes(1)
    expect(onGenerateCard.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement)
  })
})
