import { Download, Palette } from 'lucide-react'
import { exportCanvasToBlob } from '../lib/cardRenderer'
import { Button } from './ui/button'
import { useTranslation } from '../i18n/LocaleContext'
import { ReplaceUploadButton } from './ReplaceUploadButton'

interface ExportButtonProps {
  canvas: HTMLCanvasElement | null
  fileName: string
  saveLabel?: string
  multiple?: boolean
  onFilesReplaced: (files: File[]) => void
  secondaryLabel?: string
  secondaryDisabled?: boolean
  onSecondaryAction?: () => void
}

export function ExportButton({
  canvas,
  fileName,
  saveLabel,
  multiple = false,
  onFilesReplaced,
  secondaryLabel,
  secondaryDisabled = false,
  onSecondaryAction,
}: ExportButtonProps) {
  const t = useTranslation()
  const handleExport = async () => {
    if (!canvas) return
    const blob = await exportCanvasToBlob(canvas)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 border-t border-outline-variant/20 bg-surface/90 px-5 py-2 backdrop-blur-lg sm:py-3">
      <div className="mx-auto flex w-full max-w-2xl gap-2">
        <ReplaceUploadButton placement="inline" multiple={multiple} onFilesSelected={onFilesReplaced} />
        {secondaryLabel && onSecondaryAction && (
          <Button
            variant="secondary"
            className="h-10 flex-1 rounded-xl px-3 text-sm"
            onClick={onSecondaryAction}
            disabled={secondaryDisabled}
          >
            <Palette aria-hidden="true" />
            {secondaryLabel}
          </Button>
        )}
        <Button
          className="h-10 flex-1 rounded-xl bg-[#2f7d68] px-4 text-sm text-white shadow-sm active:bg-[#276756] disabled:bg-[#2f7d68] disabled:text-white disabled:opacity-40"
          onClick={handleExport}
          disabled={!canvas}
        >
          <Download aria-hidden="true" />
          {saveLabel ?? t.exportButton.saveAlbum}
        </Button>
      </div>
    </div>
  )
}
