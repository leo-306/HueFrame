import * as exifr from 'exifr'

export interface PhotoMeta {
  gps: { lat: number; lon: number } | null
  capturedAt: Date | null
}

/**
 * 解析照片文件的 GPS 坐标与拍摄时间。exifr 原生支持 JPEG/HEIC。
 * 解析失败或字段缺失时返回 null，不抛异常，交给调用方决定兜底策略。
 */
export async function parsePhotoMeta(file: File): Promise<PhotoMeta> {
  try {
    const data = await exifr.parse(file, { gps: true, pick: ['DateTimeOriginal', 'latitude', 'longitude'] })

    if (!data) {
      return { gps: null, capturedAt: null }
    }

    const gps =
      typeof data.latitude === 'number' && typeof data.longitude === 'number'
        ? { lat: data.latitude, lon: data.longitude }
        : null

    const capturedAt = data.DateTimeOriginal instanceof Date ? data.DateTimeOriginal : null

    return { gps, capturedAt }
  } catch {
    return { gps: null, capturedAt: null }
  }
}
