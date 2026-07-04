import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { heicTo } from 'heic-to'
import { loadImage } from './loadImage'

vi.mock('heic-to', () => ({ heicTo: vi.fn() }))

class MockImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

describe('loadImage', () => {
  const createObjectURL = vi.fn().mockReturnValue('blob:preview')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('Image', MockImage)
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })
    vi.mocked(heicTo).mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads browser-native images without conversion', async () => {
    const file = new File(['jpeg'], 'photo.jpg', { type: 'image/jpeg' })
    await loadImage(file)
    expect(heicTo).not.toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalledWith(file)
  })

  it('converts HEIF images to JPEG before loading them', async () => {
    const file = new File(['heif'], 'photo.heif', { type: 'image/heif' })
    const jpeg = new Blob(['jpeg'], { type: 'image/jpeg' })
    vi.mocked(heicTo).mockResolvedValue(jpeg)

    await loadImage(file)

    expect(heicTo).toHaveBeenCalledWith({ blob: file, type: 'image/jpeg', quality: 0.9 })
    expect(createObjectURL).toHaveBeenCalledWith(jpeg)
  })
})
