import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Image as CanvasImage, createCanvas } from 'canvas'
import { GridSplitPanel } from './GridSplitPanel'

/**
 * jsdom 的原生 Image 从不真正解码图片（onload 不触发，naturalWidth 恒为 0，
 * 见 tests/testImage.ts 里的说明），而 GridSplitPanel 内部走的是
 * "用户上传文件 -> new Image() -> onload" 这条真实交互路径。
 * 这里把全局 Image 直接替换成 node-canvas 的 Image 类——它能真正解码图片数据，
 * drawImage 也能正确识别它（不像自定义包装类会被 node-canvas 拒绝）。
 * src 被赋值为 blob: URL 时，忽略该值，改为加载一张预先准备好的假图片 Buffer，
 * 因为 jsdom 环境本来就不支持 URL.createObjectURL/blob: 协议解码。
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

describe('GridSplitPanel', () => {
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

  it('shows the upload zone before any photo is selected', () => {
    render(<GridSplitPanel onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
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
