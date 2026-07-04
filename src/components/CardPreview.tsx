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
    <section className="px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-primary-container/70 bg-primary-container/25 p-4 shadow-[0_0_60px_rgba(224,233,228,0.75)] sm:p-8">
        <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 leading-none shadow-sm sm:p-7">
          <canvas ref={canvasRef} width={config.width} height={config.height} className="block h-auto w-full rounded-md" />
        </div>
      </div>
    </section>
  )
}
