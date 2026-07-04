export const MOCK_PHOTO_URL =
  'http://127.0.0.1:17321/job-assets/wild002_body02/outputs/output-01.png'

export async function fetchMockPhoto(): Promise<File> {
  const response = await fetch(MOCK_PHOTO_URL)
  if (!response.ok) throw new Error(`Failed to load mock photo: ${response.status}`)
  const blob = await response.blob()
  return new File([blob], 'hueframe-mock.png', { type: blob.type || 'image/png' })
}
