import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    expect(heading.parentElement).toHaveClass('pt-10')
    expect(screen.getByText('切出节奏')).toHaveClass('font-semibold', 'text-[#00a86b]')
  })

  it('loads initialFile as the current photo when provided', async () => {
    const file = new File(['dummy'], 'from-home.jpg', { type: 'image/jpeg' })
    render(<GridSplitPanel onGenerateCard={vi.fn()} initialFile={file} />)

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
    expect(screen.queryByTestId('upload-input')).not.toBeInTheDocument()
  })

  it('does not show the grid size picker when initialFile is not provided', () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} />)
    expect(screen.queryByText('3×3')).not.toBeInTheDocument()
  })

  it('shows the grid size picker and export button after a photo is uploaded', async () => {
    const user = userEvent.setup()
    const { container } = render(<GridSplitPanel onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
    expect(screen.getByRole('tab', { name: '版式' })).toBeInTheDocument()
    const spacingTab = screen.getByRole('tab', { name: '间距与留白' })
    expect(spacingTab).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '旋转' })).toBeInTheDocument()
    await user.click(spacingTab)
    expect(screen.getAllByRole('slider')).toHaveLength(2)
    expect(screen.getByTestId('replace-upload-input')).not.toHaveAttribute('multiple')
    expect(container.querySelector('canvas')?.compareDocumentPosition(screen.getByRole('tablist'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(screen.getByText('导出图片')).toBeInTheDocument()
    expect(screen.getByText('导入到色卡')).toBeInTheDocument()
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

    await waitFor(() => expect(screen.getByText('导入到色卡')).not.toBeDisabled())
    fireEvent.click(screen.getByText('导入到色卡'))

    expect(onGenerateCard).toHaveBeenCalledTimes(1)
    expect(onGenerateCard.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement)
  })
})
