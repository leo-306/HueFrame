import { ImagePlus } from 'lucide-react'

interface MultiUploadZoneProps {
  onFilesSelected: (files: File[]) => void
}

export function MultiUploadZone({ onFilesSelected }: MultiUploadZoneProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files))
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files))
    }
  }

  return (
    <label
      className="flex aspect-4/3 w-full max-w-120 cursor-pointer flex-col items-center justify-center rounded-4xl border-2 border-dashed border-[rgba(195,199,196,0.5)] bg-[rgba(255,255,255,0.4)] shadow-[0_0_50px_rgba(87,96,93,0.04)] backdrop-blur-md transition-[box-shadow,border-color,background-color] duration-400 hover:border-primary hover:bg-[rgba(255,255,255,0.8)] hover:shadow-[0_0_60px_rgba(87,96,93,0.08)]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <span
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(195,199,196,0.2)] bg-surface-container-low text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        aria-hidden="true"
      >
        <ImagePlus size={32} strokeWidth={1.3} />
      </span>
      <p className="m-0 text-xs font-medium tracking-wider text-on-surface-variant opacity-80">上传多张照片开始</p>
      <input
        data-testid="grid-upload-input"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  )
}
