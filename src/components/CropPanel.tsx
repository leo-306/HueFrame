import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '../i18n/LocaleContext'
import { UploadZone } from './UploadZone'
import { Button } from './ui/button'
import { loadImage } from '../lib/loadImage'
import {
  CROP_RATIOS,
  MAX_SCALE,
  MIN_SCALE,
  computeCropRect,
  croppedExportSize,
} from '../lib/cropGeometry'
import type { CropState } from '../lib/cropGeometry'

interface CropPanelProps {
  /** 裁剪完成后把结果文件交回上层，用于接着生成色卡。 */
  onCropped: (file: File) => void
  onCancel?: () => void
}

const PREVIEW_WIDTH = 320

export function CropPanel({ onCropped, onCancel }: CropPanelProps) {
  const t = useTranslation()
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ratioId, setRatioId] = useState<string>(CROP_RATIOS[1].id)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null)

  const ratio = CROP_RATIOS.find((r) => r.id === ratioId) ?? CROP_RATIOS[1]
  const previewHeight = Math.round(PREVIEW_WIDTH / ratio.value)

  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    resetView()
  }, [ratioId, resetView])

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setError(null)
      try {
        setPhoto(await loadImage(file))
        resetView()
      } catch {
        setError(t.common.imageLoadFailed)
      } finally {
        setIsLoading(false)
      }
    },
    [resetView, t.common.imageLoadFailed]
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!photo) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    }
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current
    if (!drag || drag.pointerId !== event.pointerId) return
    setOffset({
      x: clampOffset(drag.originX + (event.clientX - drag.startX) / PREVIEW_WIDTH),
      y: clampOffset(drag.originY + (event.clientY - drag.startY) / PREVIEW_WIDTH),
    })
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) dragState.current = null
  }

  const handleExport = useCallback(async () => {
    if (!photo) return
    const state: CropState = { ratio: ratio.value, scale, offsetX: offset.x, offsetY: offset.y }
    const rect = computeCropRect(photo.naturalWidth, photo.naturalHeight, state)
    const size = croppedExportSize(rect)
    if (size.width === 0 || size.height === 0) return

    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(photo, rect.x, rect.y, rect.width, rect.height, 0, 0, size.width, size.height)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    onCropped(new File([blob], 'hueframe-cropped.png', { type: 'image/png' }))
  }, [photo, ratio.value, scale, offset, onCropped])

  // 按裁剪矩形精确摆放图片：缩放到"取图矩形正好填满裁剪框"，
  // 再偏移到矩形的左上角与框左上角对齐——用户看到的就是最终裁出来的结果。
  const rect = photo
    ? computeCropRect(photo.naturalWidth, photo.naturalHeight, {
        ratio: ratio.value,
        scale,
        offsetX: offset.x,
        offsetY: offset.y,
      })
    : null

  // 预览直接画在 canvas 上：loadImage 加载完就把 blob URL 撤销了，
  // 把 photo.src 塞给 <img> 只会得到一张裂图；画布则天然是所见即所得。
  // 这个 effect 必须留在早退之前，否则上传前后 hook 数量不一致会直接报错。
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !photo || !rect || rect.width <= 0) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(PREVIEW_WIDTH * dpr)
    canvas.height = Math.round(previewHeight * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(photo, rect.x, rect.y, rect.width, rect.height, 0, 0, canvas.width, canvas.height)
  }, [photo, rect, previewHeight])

  if (!photo) {
    return (
      <div className="px-5 pt-10 sm:px-8">
        {error && (
          <p role="alert" className="type-label mb-4 text-center text-error">
            {error}
          </p>
        )}
        {isLoading ? (
          <p className="type-body text-center text-on-surface-variant">{t.common.processing}</p>
        ) : (
          <UploadZone onFileSelected={handleFile} />
        )}
      </div>
    )
  }

  return (
    <div className="px-5 pt-8 sm:px-8">
      {error && (
        <p role="alert" className="type-label mb-4 text-center text-error">
          {error}
        </p>
      )}

      <div className="mx-auto w-full max-w-md">
        {/* 拖动区：照片按目标比例裁切后居中显示，指针拖动改变取图位置 */}
        <div
          data-testid="crop-surface"
          role="application"
          aria-label={t.crop.dragHint}
          className="relative mx-auto overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest touch-none select-none"
          style={{ width: PREVIEW_WIDTH, height: previewHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <canvas
            ref={canvasRef}
            data-testid="crop-canvas"
            className="pointer-events-none block"
            style={{ width: PREVIEW_WIDTH, height: previewHeight }}
          />
        </div>

        <div className="mt-6">
          <div className="type-body mb-3 text-on-surface-variant">{t.crop.ratio}</div>
          <div className="grid grid-cols-3 gap-3">
            {CROP_RATIOS.map((option) => (
              <Button
                key={option.id}
                variant={option.id === ratioId ? 'secondary' : 'outline'}
                size="sm"
                className="h-12 bg-surface"
                aria-pressed={option.id === ratioId}
                onClick={() => setRatioId(option.id)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="type-body mb-3 text-on-surface-variant">
            {t.crop.zoom} · {scale.toFixed(1)}×
          </div>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.1}
            value={scale}
            aria-label={t.crop.zoom}
            onChange={(event) => setScale(Number(event.target.value))}
            className="w-full accent-primary"
          />
          <p className="type-caption mt-2 text-on-surface-variant">{t.crop.hint}</p>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setPhoto(null)}>
            {t.common.reupload}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => void handleExport()}>
            {t.crop.confirm}
          </Button>
        </div>
        {onCancel && (
          <Button variant="ghost" className="mt-3 w-full" onClick={onCancel}>
            {t.crop.cancel}
          </Button>
        )}
      </div>
    </div>
  )
}

function clampOffset(value: number): number {
  return Math.min(1, Math.max(-1, value))
}
