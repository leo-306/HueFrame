export const IMAGE_FILE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif'

function isHeifFile(file: File): boolean {
  return /image\/hei[cf]/i.test(file.type) || /\.(hei[cf])$/i.test(file.name)
}

async function browserReadableBlob(file: File): Promise<Blob> {
  if (!isHeifFile(file)) return file

  const { heicTo } = await import('heic-to')
  const converted = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 })
  if (!(converted instanceof Blob)) {
    throw new Error('failed to convert HEIF image')
  }
  return converted
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const source = await browserReadableBlob(file)

  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(source)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('failed to load image'))
    }
    img.src = objectUrl
  })
}
