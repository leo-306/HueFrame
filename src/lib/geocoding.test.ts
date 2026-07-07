import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveLocationName } from './geocoding'

describe('resolveLocationName', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('returns a place name when the geocoding API succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        address: { city: 'Kyoto', country: 'Japan' },
      }),
    } as Response)

    const name = await resolveLocationName({ lat: 35.0116, lon: 135.7681 })
    expect(name).toBe('Kyoto')
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('zoom=10'), {
      headers: { Accept: 'application/json' },
    })
  })

  it('falls back to coordinate text when the API call fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const name = await resolveLocationName({ lat: 35.0116, lon: 135.7681 })
    expect(name).toBe('35.0116, 135.7681')
  })

  it('falls back to coordinate text when the API returns a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const name = await resolveLocationName({ lat: 1.5, lon: 2.5 })
    expect(name).toBe('1.5000, 2.5000')
  })
})
