import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
    const user = userEvent.setup()
    const { container } = render(<GridCollagePanel onGenerateCard={vi.fn()} />)

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
    expect(screen.getByRole('tab', { name: '版式' })).toBeInTheDocument()
    const spacingTab = screen.getByRole('tab', { name: '间距与留白' })
    expect(spacingTab).toBeInTheDocument()
    await user.click(spacingTab)
    expect(screen.getAllByRole('slider')).toHaveLength(1)
    expect(screen.getByTestId('replace-upload-input')).toHaveAttribute('multiple')
    expect(container.querySelector('canvas')?.compareDocumentPosition(screen.getByRole('tablist'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
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
