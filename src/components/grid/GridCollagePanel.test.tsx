import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GridCollagePanel } from './GridCollagePanel'
import { installMockUploadImage } from '../../../tests/mockUploadImage'

describe('GridCollagePanel', () => {
  let restoreMockImage: () => void

  beforeEach(() => {
    restoreMockImage = installMockUploadImage()
  })

  afterEach(() => {
    restoreMockImage()
  })

  it('shows the multi-upload zone before any photos are selected', () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)
    const heading = screen.getByRole('heading')
    expect(heading).toBeInTheDocument()
    expect(heading.parentElement).toHaveClass('pt-10')
    expect(screen.getByText('拼出灵感')).toHaveClass('font-semibold', 'text-[#00a86b]')
  })

  it('shows the grid size picker after photos are uploaded', async () => {
    const { container } = render(<GridCollagePanel onGenerateCard={vi.fn()} />)

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: '版式' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '九宫格模板' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '纯净网格' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: '中心主角' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '胶片印样' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '旅行手帐' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '日常 PLOG' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '杂志矩阵' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '色块叙事' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '电影无痕' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '间距与留白' })).toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
    expect(screen.getAllByRole('slider')).toHaveLength(2)
    expect(screen.getByRole('slider', { name: '图片留白' })).toHaveAttribute('aria-valuemax', '80')
    expect(screen.getByTestId('replace-upload-input')).toHaveAttribute('multiple')
    expect(container.querySelector('canvas')?.compareDocumentPosition(screen.getByRole('heading', { name: '版式' }))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
  })

  it('switches collage templates and applies their spacing preset', async () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })] } })

    const filmButton = await screen.findByRole('button', { name: '胶片印样' })
    fireEvent.click(filmButton)

    expect(filmButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('slider', { name: '留白 (Margin)' })).toHaveAttribute('aria-valuenow', '14')
    expect(screen.getByRole('slider', { name: '图片留白' })).toHaveAttribute('aria-valuenow', '20')
  })

  it('uses a fixed 3:4 canvas and hides the grid picker for editorial templates', async () => {
    const { container } = render(<GridCollagePanel onGenerateCard={vi.fn()} />)
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })] } })

    const plogButton = await screen.findByRole('button', { name: '日常 PLOG' })
    fireEvent.click(plogButton)

    await waitFor(() => {
      const canvas = container.querySelector('canvas')
      expect(canvas?.width).toBe(900)
      expect(canvas?.height).toBe(1200)
    })
    expect(screen.queryByRole('heading', { name: '版式' })).not.toBeInTheDocument()
  })

  it('shows a hint when more photos are uploaded than grid cells', async () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)

    const files = Array.from({ length: 5 }, (_, i) => new File([`${i}`], `${i}.jpg`, { type: 'image/jpeg' }))
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => screen.getByRole('button', { name: '2×2' }))
    fireEvent.click(screen.getByRole('button', { name: '2×2' }))

    await waitFor(() => expect(screen.getByText('仅使用前 4 张')).toBeInTheDocument())
  })

  it('calls onGenerateCard with the composited canvas when the button is clicked', async () => {
    const onGenerateCard = vi.fn()
    render(<GridCollagePanel onGenerateCard={onGenerateCard} />)

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => expect(screen.getByText('导入到色卡')).not.toBeDisabled())
    fireEvent.click(screen.getByText('导入到色卡'))

    expect(onGenerateCard).toHaveBeenCalledTimes(1)
    expect(onGenerateCard.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement)
  })
})
