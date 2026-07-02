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

  return <canvas ref={canvasRef} width={config.width} height={config.height} />
}
