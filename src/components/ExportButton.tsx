import { Download } from 'lucide-react'
import { exportCanvasToBlob } from '../lib/cardRenderer'
import { Button } from './ui/button'
import { useTranslation } from '../i18n/LocaleContext'

interface ExportButtonProps {
  canvas: HTMLCanvasElement | null
  fileName: string
}

export function ExportButton({ canvas, fileName }: ExportButtonProps) {
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
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 border-t border-outline-variant/20 bg-surface/90 px-5 py-4 backdrop-blur-lg sm:py-5">
      <div className="mx-auto flex max-w-[1140px] justify-end gap-3">
        <Button
          variant="outline"
          className="h-12 min-w-32 rounded-full bg-surface px-6 text-base"
          onClick={handleExport}
          disabled={!canvas}
        >
          {t.exportButton.exportPng}
        </Button>
        <Button className="h-12 min-w-40 rounded-full bg-primary-container px-6 text-base text-on-primary-container" disabled>
          <Download aria-hidden="true" />
          {t.exportButton.saveAlbum}
        </Button>
      </div>
    </div>
  )
}
