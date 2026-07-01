import { exportCanvasToBlob } from '../lib/cardRenderer'

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
    <button onClick={handleExport} disabled={!canvas}>
      导出图片
    </button>
  )
}
