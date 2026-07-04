import { Download } from 'lucide-react'
import { exportCanvasToBlob } from '../lib/cardRenderer'
import { Button } from './ui/button'

interface ExportButtonProps {
  canvas: HTMLCanvasElement | null
  fileName: string
}

export function ExportButton({ canvas, fileName }: ExportButtonProps) {
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
    <Button className="w-full" size="lg" onClick={handleExport} disabled={!canvas}>
      <Download aria-hidden="true" />
      导出图片
    </Button>
  )
}
