import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchMockPhoto, MOCK_PHOTO_URL } from './mockPhoto'

describe('fetchMockPhoto', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('downloads the development mock as an image file', async () => {
    const blob = new Blob(['mock-image'], { type: 'image/png' })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => blob })
    vi.stubGlobal('fetch', fetchMock)

    const file = await fetchMockPhoto()

    expect(fetchMock).toHaveBeenCalledWith(MOCK_PHOTO_URL)
    expect(file.name).toBe('hueframe-mock.png')
    expect(file.type).toBe('image/png')
  })
})
