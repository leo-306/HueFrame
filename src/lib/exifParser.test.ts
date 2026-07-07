import { describe, it, expect, vi } from 'vitest'
import { parsePhotoMeta } from './exifParser'
import * as exifr from 'exifr'

vi.mock('exifr', () => ({
  parse: vi.fn(),
}))

describe('parsePhotoMeta', () => {
  it('returns GPS coordinates and capture time when present', async () => {
    vi.mocked(exifr.parse).mockResolvedValue({
      latitude: 35.0116,
      longitude: 135.7681,
      DateTimeOriginal: new Date('2026-04-10T09:30:00'),
    })

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toEqual({ lat: 35.0116, lon: 135.7681 })
    expect(meta.capturedAt).toEqual(new Date('2026-04-10T09:30:00'))
    expect(exifr.parse).toHaveBeenCalledWith(
      file,
      expect.objectContaining({
        gps: true,
        pick: expect.arrayContaining(['GPSLatitude', 'GPSLatitudeRef', 'GPSLongitude', 'GPSLongitudeRef']),
      })
    )
  })

  it('returns null gps and capturedAt when EXIF has no data', async () => {
    vi.mocked(exifr.parse).mockResolvedValue(undefined)

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toBeNull()
    expect(meta.capturedAt).toBeNull()
  })

  it('returns null values when exifr throws', async () => {
    vi.mocked(exifr.parse).mockRejectedValue(new Error('parse failed'))

    const file = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const meta = await parsePhotoMeta(file)

    expect(meta.gps).toBeNull()
    expect(meta.capturedAt).toBeNull()
  })
})
