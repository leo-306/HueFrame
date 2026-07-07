import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'
import type { CardConfig, TemplateRenderer } from '../templates/types'
import { renderCardWithMargin } from '../lib/cardRenderer'
import { useTranslation } from '../i18n/LocaleContext'
import { Button } from './ui/button'
import { CARD_INFO_FONT_LOAD } from '../lib/fonts'

interface CardPreviewProps {
  config: CardConfig
  renderer: TemplateRenderer
  templateName?: string
  isMock?: boolean
  onPreviousTemplate?: () => void
  onNextTemplate?: () => void
  onShowAllTemplates?: () => void
  onReady?: (canvas: HTMLCanvasElement) => void
}

export function CardPreview({
  config,
  renderer,
  templateName,
  isMock = false,
  onPreviousTemplate,
  onNextTemplate,
  onShowAllTemplates,
  onReady,
}: CardPreviewProps) {
  const t = useTranslation()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let cancelled = false
    const render = () => {
      renderCardWithMargin(ctx, config, renderer)
      onReady?.(canvas)
    }

    render()
    document.fonts?.load(CARD_INFO_FONT_LOAD).then(() => {
      if (!cancelled) render()
    })

    return () => {
      cancelled = true
    }
  }, [config, renderer, onReady])

  return (
    <section className="px-5 pt-8 sm:px-8 sm:pt-12">
      <div className="relative mx-auto w-full max-w-2xl">
        {isMock && (
          <span className="type-caption absolute top-3 left-3 z-10 rounded-full bg-on-surface px-2.5 py-1 font-semibold tracking-widest text-surface shadow-sm">
            MOCK
          </span>
        )}
        <div className="mx-auto w-full max-w-2xl rounded-[28px] border border-primary-container/70 bg-primary-container/25 p-4 shadow-[0_0_60px_rgba(224,233,228,0.75)] sm:p-8">
          <div className="overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest p-3 leading-none shadow-sm sm:p-7">
            <canvas ref={canvasRef} width={config.width} height={config.height} className="block h-auto w-full rounded-md" />
          </div>
        </div>
      </div>
      {(templateName || onPreviousTemplate || onNextTemplate || onShowAllTemplates) && (
        <div
          data-testid="template-controls"
          className="relative mx-auto mt-4 flex h-8 w-full max-w-2xl items-center justify-between text-on-surface-variant"
        >
          {onPreviousTemplate && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onPreviousTemplate}
              aria-label={t.templatePicker.previousTemplate}
              className="rounded-full border-outline-variant/50 bg-surface-container-lowest shadow-sm hover:bg-primary-container"
            >
              <ChevronLeft />
            </Button>
          )}
          {templateName && onShowAllTemplates ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onShowAllTemplates}
              aria-label={t.templatePicker.viewAllTemplates}
              className="absolute left-1/2 -translate-x-1/2 px-3"
            >
              <LayoutGrid data-icon="inline-start" />
              {templateName}
            </Button>
          ) : templateName ? (
            <span className="type-label absolute left-1/2 -translate-x-1/2 px-1">{templateName}</span>
          ) : null}
          {onNextTemplate && (
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={onNextTemplate}
              aria-label={t.templatePicker.nextTemplate}
              className="rounded-full border-outline-variant/50 bg-surface-container-lowest shadow-sm hover:bg-primary-container"
            >
              <ChevronRight />
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
