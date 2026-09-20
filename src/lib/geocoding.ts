export interface Coordinates {
  lat: number
  lon: number
}

function formatCoordinateFallback({ lat, lon }: Coordinates): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}

/** 逆地理编码超时：弱网/服务挂起时不让整条处理管线卡在 loading。 */
const REQUEST_TIMEOUT_MS = 5000

/** 同一坐标的解析结果缓存，避免重复请求（Nominatim 有调用频率限制）。 */
const locationCache = new Map<string, string>()

function cacheKey({ lat, lon }: Coordinates): string {
  // 5 位小数约 1 米精度，足够命中同一地点
  return `${lat.toFixed(5)},${lon.toFixed(5)}`
}

/**
 * 用 Nominatim（OpenStreetMap 免费逆地理编码服务）把坐标转换为地名。
 * 带超时、按界面语言请求、结果缓存；网络失败或响应异常时降级返回
 * 格式化的经纬度文本，不抛异常。
 */
export async function resolveLocationName(coords: Coordinates, locale = 'zh'): Promise<string> {
  const key = cacheKey(coords)
  const cached = locationCache.get(key)
  if (cached) return cached

  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}` +
    `&format=json&zoom=10&accept-language=${encodeURIComponent(locale)}`

  let result: string
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (!response.ok) {
      result = formatCoordinateFallback(coords)
    } else {
      const data = await response.json()
      const city = data.address?.city ?? data.address?.town ?? data.address?.village
      result = city ?? formatCoordinateFallback(coords)
    }
  } catch {
    result = formatCoordinateFallback(coords)
  }

  locationCache.set(key, result)
  return result
}
