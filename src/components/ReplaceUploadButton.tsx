import { ImageUp } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { IMAGE_FILE_ACCEPT } from '../lib/loadImage'

interface ReplaceUploadButtonProps {
  multiple?: boolean
  placement?: 'overlay' | 'inline'
  onFilesSelected: (files: File[]) => void
}

export function ReplaceUploadButton({ multiple = false, placement = 'overlay', onFilesSelected }: ReplaceUploadButtonProps) {
  const t = useTranslation()
  const placementClassName = placement === 'overlay'
    ? 'absolute top-3 right-3 z-20 min-h-9 rounded-full px-3 py-1.5 shadow-sm backdrop-blur-md'
    : 'h-10 flex-1 justify-center rounded-xl px-4 text-sm'

  return (
    <label className={`type-caption flex cursor-pointer items-center gap-1.5 border border-outline-variant/50 bg-surface-container-lowest/90 font-medium text-on-surface active:bg-primary-container ${placementClassName}`}>
      <ImageUp className="size-4" aria-hidden="true" />
      {t.common.reupload}
      <input
        data-testid="replace-upload-input"
        type="file"
        accept={IMAGE_FILE_ACCEPT}
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length > 0) onFilesSelected(files)
          event.target.value = ''
        }}
      />
    </label>
  )
}
