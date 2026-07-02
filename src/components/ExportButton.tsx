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
    <button className="btn-primary" onClick={handleExport} disabled={!canvas}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 3v12" strokeLinecap="round" />
        <path d="M7 10l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 20h14" strokeLinecap="round" />
      </svg>
      导出图片
    </button>
  )
}
