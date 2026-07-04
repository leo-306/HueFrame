interface UploadZoneProps {
  onFileSelected: (file: File) => void
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <label className="upload-zone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <span className="upload-zone-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.3">
          <rect x="2.5" y="4" width="14" height="14" rx="2" />
          <circle cx="7" cy="9" r="1.3" />
          <path d="M16.5 14l-3.5-3.5-3 3-2-2-3.5 3.5" />
          <path d="M18.5 3v6M15.5 6h6" />
        </svg>
      </span>
      <p className="upload-zone-hint">上传一张照片开始</p>
      <input data-testid="upload-input" type="file" accept="image/*" onChange={handleChange} className="visually-hidden" />
    </label>
  )
}
