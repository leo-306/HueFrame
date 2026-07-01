import { useEffect, useRef } from 'react'
import type { CardConfig, TemplateRenderer } from '../templates/types'

interface CardPreviewProps {
  config: CardConfig
  renderer: TemplateRenderer
}

export function CardPreview({ config, renderer }: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    renderer(ctx, config)
  }, [config, renderer])

  return <canvas ref={canvasRef} width={config.width} height={config.height} />
}
