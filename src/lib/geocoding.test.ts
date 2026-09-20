import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resolveLocationName } from './geocoding'

describe('resolveLocationName', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  // 每项用不同坐标，避开模块级结果缓存的跨测试污染
  const KYOTO = { lat: 35.0116, lon: 135.7681 }
  const PARIS = { lat: 48.8566, lon: 2.3522 }
  const ODD = { lat: 1.5, lon: 2.5 }

  it('returns a place name when the geocoding API succeeds', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: 'Kyoto', country: 'Japan' } }),
    } as Response)

    const name = await resolveLocationName(KYOTO)
    expect(name).toBe('Kyoto')
    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toContain('zoom=10')
    expect(url).toContain('accept-language=zh')
    expect(init?.headers).toEqual({ Accept: 'application/json' })
    // 带超时信号，弱网不会卡住整条管线
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('requests the location in the given locale', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: 'Paris' } }),
    } as Response)

    await resolveLocationName(PARIS, 'en')
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('accept-language=en')
  })

  it('falls back to coordinate text when the API call fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network error'))

    const name = await resolveLocationName({ lat: 40.0, lon: -100.0 })
    expect(name).toBe('40.0000, -100.0000')
  })

  it('falls back to coordinate text when the API returns a non-ok response', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    const name = await resolveLocationName(ODD)
    expect(name).toBe('1.5000, 2.5000')
  })

  it('caches results so the same coordinates are only fetched once', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ address: { city: 'Reykjavik' } }),
    } as Response)

    const coords = { lat: 64.1466, lon: -21.9426 }
    await resolveLocationName(coords)
    await resolveLocationName(coords)

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
