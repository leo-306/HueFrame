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
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="1.5" />
          <path d="M21 15l-5-5-4 4-3-3-6 6" />
          <path d="M17 4v4M15 6h4" />
        </svg>
      </span>
      <p className="upload-zone-hint">上传一张照片开始</p>
      <input data-testid="upload-input" type="file" accept="image/*" onChange={handleChange} className="visually-hidden" />
    </label>
  )
}
