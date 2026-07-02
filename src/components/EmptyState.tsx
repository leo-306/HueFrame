import { UploadZone } from './UploadZone'

interface EmptyStateProps {
  onFileSelected: (file: File) => void
}

export function EmptyState({ onFileSelected }: EmptyStateProps) {
  return (
    <div>
      <h2>给照片，配一套颜色。</h2>
      <UploadZone onFileSelected={onFileSelected} />
      <p>本地解析支持 JPG / PNG / WEBP</p>
    </div>
  )
}
