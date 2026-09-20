import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CropPanel } from './CropPanel'
import { installMockUploadImage } from '../../tests/mockUploadImage'

describe('CropPanel', () => {
  let restore: () => void

  beforeEach(() => {
    restore = installMockUploadImage()
  })

  afterEach(() => {
    restore()
  })

  const upload = () => {
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [new File(['x'], 'trip.png', { type: 'image/png' })] } })
  }

  it('starts on the upload zone', () => {
    render(<CropPanel onCropped={vi.fn()} />)
    expect(screen.getByTestId('upload-input')).toBeInTheDocument()
  })

  it('reveals the crop controls once a photo is loaded', async () => {
    render(<CropPanel onCropped={vi.fn()} />)
    upload()

    await waitFor(() => expect(screen.getByTestId('crop-canvas')).toBeInTheDocument())
    expect(screen.getByRole('button', { name: '4:5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1:1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '16:9' })).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: /缩放/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '裁好了' })).toBeInTheDocument()
  })

  it('resizes the crop frame to the selected ratio', async () => {
    render(<CropPanel onCropped={vi.fn()} />)
    upload()
    await waitFor(() => expect(screen.getByTestId('crop-canvas')).toBeInTheDocument())

    // 1:1 是默认比例，预览框应为正方形
    expect(screen.getByTestId('crop-canvas').style.width).toBe('320px')
    expect(screen.getByTestId('crop-canvas').style.height).toBe('320px')

    fireEvent.click(screen.getByRole('button', { name: '16:9' }))
    await waitFor(() => expect(screen.getByTestId('crop-canvas').style.height).toBe('180px'))
  })

  it('hands the cropped file back on confirm', async () => {
    const onCropped = vi.fn()
    render(<CropPanel onCropped={onCropped} />)
    upload()
    await waitFor(() => expect(screen.getByTestId('crop-canvas')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '裁好了' }))

    await waitFor(() => expect(onCropped).toHaveBeenCalledTimes(1))
    const file = onCropped.mock.calls[0][0] as File
    expect(file.type).toBe('image/png')
    expect(file.name).toBe('hueframe-cropped.png')
  })

  it('returns to the upload zone when re-upload is pressed', async () => {
    render(<CropPanel onCropped={vi.fn()} />)
    upload()
    await waitFor(() => expect(screen.getByTestId('crop-canvas')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: '重新上传' }))

    await waitFor(() => expect(screen.getByTestId('upload-input')).toBeInTheDocument())
    expect(screen.queryByTestId('crop-canvas')).not.toBeInTheDocument()
  })

  it('reports a failure instead of the controls when the image cannot be decoded', async () => {
    const original = globalThis.Image
    // 让解码失败：onload 永不触发，onerror 立即触发
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_value: string) {
          setTimeout(() => this.onerror?.(), 0)
        }
      }
    )

    render(<CropPanel onCropped={vi.fn()} />)
    upload()

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.queryByTestId('crop-canvas')).not.toBeInTheDocument()

    vi.stubGlobal('Image', original)
  })
})
