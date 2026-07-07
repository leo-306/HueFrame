export interface Coordinates {
  lat: number
  lon: number
}

function formatCoordinateFallback({ lat, lon }: Coordinates): string {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}

/**
 * 用 Nominatim（OpenStreetMap 免费逆地理编码服务）把坐标转换为地名。
 * 网络失败或响应异常时，降级返回格式化的经纬度文本，不抛异常。
 */
export async function resolveLocationName(coords: Coordinates): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json&zoom=10`

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return formatCoordinateFallback(coords)
    }

    const data = await response.json()
    const city = data.address?.city ?? data.address?.town ?? data.address?.village

    if (city) {
      return city
    }

    return formatCoordinateFallback(coords)
  } catch {
    return formatCoordinateFallback(coords)
  }
}
