import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Image as CanvasImage, createCanvas } from 'canvas'
import { GridTool } from './GridTool'

/**
 * jsdom 的原生 Image 从不真正解码图片（onload 不触发，naturalWidth 恒为 0），
 * 这里把全局 Image 替换成 node-canvas 的 Image 类，做法与
 * GridSplitPanel.test.tsx / GridCollagePanel.test.tsx 保持一致。
 */
const FAKE_IMAGE_BUFFER = createCanvas(4, 4).toBuffer('image/png')

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

describe('GridTool', () => {
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

  it('renders the split panel by default', () => {
    render(<GridTool onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
  })

  it('renders both sub-tab labels', () => {
    render(<GridTool onGenerateCard={vi.fn()} />)
    expect(screen.getByText('切分')).toBeInTheDocument()
    expect(screen.getByText('拼图')).toBeInTheDocument()
  })

  it('switches to the collage panel when the 拼图 tab is clicked', async () => {
    const user = userEvent.setup()
    render(<GridTool onGenerateCard={vi.fn()} />)

    await user.click(screen.getByText('拼图'))

    expect(screen.getByText(/上传多张照片/)).toBeInTheDocument()
  })

  it('keeps split panel state when switching away and back to it', async () => {
    const user = userEvent.setup()
    render(<GridTool onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByText('拼图'))
    await user.click(screen.getByText('切分'))

    expect(screen.queryByText(/上传一张照片/)).not.toBeInTheDocument()
  })
})
