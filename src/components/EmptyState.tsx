import { UploadZone } from './UploadZone'

interface EmptyStateProps {
  onFileSelected: (file: File) => void
}

export function EmptyState({ onFileSelected }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-glow empty-state-glow-primary" aria-hidden="true" />
      <div className="empty-state-glow empty-state-glow-tertiary" aria-hidden="true" />
      <h2>给照片，配一套颜色。</h2>
      <UploadZone onFileSelected={onFileSelected} />
      <p className="format-hint">本地解析支持 JPG / PNG / WEBP</p>
    </div>
  )
}
