import { ImagePlus } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { IMAGE_FILE_ACCEPT } from '../lib/loadImage'

interface UploadZoneProps {
  onFileSelected: (file: File) => void
}

export function UploadZone({ onFileSelected }: UploadZoneProps) {
  const t = useTranslation()
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
      <p className="type-body m-0 font-medium text-on-surface-variant">{t.uploadZone.prompt}</p>
      <input
        data-testid="upload-input"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  )
}
