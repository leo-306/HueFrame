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
    vi.restoreAllMocks()
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
    const { container } = render(<GridSplitPanel onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: '版式' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '间距与留白' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '旋转' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getAllByRole('slider')).toHaveLength(3)
    expect(screen.getByRole('slider', { name: '图片留白' })).toHaveAttribute('aria-valuemax', '80')
    expect(screen.getByTestId('replace-upload-input')).not.toHaveAttribute('multiple')
    expect(container.querySelector('canvas')?.compareDocumentPosition(screen.getByRole('heading', { name: '版式' }))).toBe(
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

  it('presents the rotation guidance as a tip', async () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} initialFile={new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })} />)

    await screen.findByRole('heading', { name: '旋转' })

    const tip = screen.getByRole('note')
    expect(tip).toHaveClass('bg-primary-container/45', 'border-primary/15')
    expect(tip).toHaveTextContent('操作提示')
    expect(tip).toHaveTextContent('点击网格中的单元格，可单独调整其旋转角度')
  })

  it('limits random rotation to plus or minus 5 degrees', async () => {
    const user = userEvent.setup()
    vi.spyOn(Math, 'random').mockReturnValue(1)
    const { container } = render(
      <GridSplitPanel onGenerateCard={vi.fn()} initialFile={new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })} />
    )

    await screen.findByRole('heading', { name: '旋转' })
    await user.click(screen.getByRole('button', { name: '随机旋转' }))

    const previewCanvas = container.querySelector('canvas:not(.hidden)') as HTMLCanvasElement
    vi.spyOn(previewCanvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 300,
      height: 300,
      right: 300,
      bottom: 300,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    fireEvent.click(previewCanvas, { clientX: 50, clientY: 50 })

    expect(screen.getByText('5°')).toBeInTheDocument()
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
