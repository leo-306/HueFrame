import { useEffect, useRef } from 'react'
import type { CardConfig, TemplateRenderer } from '../templates/types'
import { renderCardWithMargin } from '../lib/cardRenderer'

interface CardPreviewProps {
  config: CardConfig
  renderer: TemplateRenderer
  onReady?: (canvas: HTMLCanvasElement) => void
}

export function CardPreview({ config, renderer, onReady }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderCardWithMargin(ctx, config, renderer)
    onReady?.(canvas)
  }, [config, renderer, onReady])

  return (
    <div className="p-5">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest leading-none">
        <canvas ref={canvasRef} width={config.width} height={config.height} className="block h-auto w-full" />
      </div>
    </div>
  )
}
