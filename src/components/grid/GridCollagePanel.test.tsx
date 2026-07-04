import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Image as CanvasImage, createCanvas } from 'canvas'
import { GridCollagePanel } from './GridCollagePanel'

/**
 * 同 GridSplitPanel.test.tsx 的说明：jsdom 原生 Image 不会真正解码图片，
 * onload 从不触发。这里用 node-canvas 的 Image 类替换全局 Image，
 * 拦截 src setter 忽略传入的 blob URL，改为加载一张预先准备好的假 PNG Buffer。
 * GridCollagePanel 会用 Promise.all(files.map(loadImage)) 并发加载多张图片，
 * 每个 MockImage 实例都是独立的，互不影响，能正确并发 resolve。
 */
const FAKE_IMAGE_BUFFER = createCanvas(4, 4).toBuffer('image/png')

// `canvas`'s Image class declares `src` as a plain property (backed by a native
// accessor on the prototype), so TS forbids a subclass from redeclaring it as a
// get/set pair. Defining the accessor per-instance in the constructor sidesteps
// that static check while still delegating to the real (per-instance) native
// accessor for storage, and redirecting every assignment to the fake buffer.
const nativeSrcDescriptor = Object.getOwnPropertyDescriptor(CanvasImage.prototype, 'src')!

class MockImage extends CanvasImage {
  constructor() {
    super()
    Object.defineProperty(this, 'src', {
      get: () => nativeSrcDescriptor.get!.call(this),
      set: () => nativeSrcDescriptor.set!.call(this, FAKE_IMAGE_BUFFER),
    })
  }
}

describe('GridCollagePanel', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', MockImage)
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock'),
      revokeObjectURL: vi.fn(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the multi-upload zone before any photos are selected', () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传多张照片/)).toBeInTheDocument()
  })

  it('shows the grid size picker after photos are uploaded', async () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)

    const files = [
      new File(['a'], 'a.jpg', { type: 'image/jpeg' }),
      new File(['b'], 'b.jpg', { type: 'image/jpeg' }),
    ]
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => expect(screen.getByText('3×3')).toBeInTheDocument())
  })

  it('shows a hint when more photos are uploaded than grid cells', async () => {
    render(<GridCollagePanel onGenerateCard={vi.fn()} />)

    const files = Array.from({ length: 5 }, (_, i) => new File([`${i}`], `${i}.jpg`, { type: 'image/jpeg' }))
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files } })

    await waitFor(() => screen.getByText('2×2'))
    fireEvent.click(screen.getByText('2×2'))

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

    await waitFor(() => expect(screen.getByText('生成色卡')).not.toBeDisabled())
    fireEvent.click(screen.getByText('生成色卡'))

    expect(onGenerateCard).toHaveBeenCalledTimes(1)
    expect(onGenerateCard.mock.calls[0][0]).toBeInstanceOf(HTMLCanvasElement)
  })
})
