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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <div className="upload-zone" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <p>上传一张照片开始</p>
      <input data-testid="upload-input" type="file" accept="image/*" onChange={handleChange} />
    </div>
  )
}
