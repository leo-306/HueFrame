import { useCallback, useEffect, useRef, useState } from 'react'
import { FILTERS, createFilterThumbnail, type FilterName } from '../lib/filters'
import { useTranslation } from '../i18n/LocaleContext'

const THUMBNAIL_SIZE = 64

interface FilterThumbnailProps {
  photo: HTMLImageElement
  filter: FilterName
}

function FilterThumbnail({ photo, filter }: FilterThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const thumbnail = createFilterThumbnail(photo, filter, THUMBNAIL_SIZE)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(thumbnail, 0, 0)
  }, [photo, filter])

  return <canvas ref={canvasRef} width={THUMBNAIL_SIZE} height={THUMBNAIL_SIZE} />
}

interface FilterPickerProps {
  selected: FilterName
  photo: HTMLImageElement
  onSelect: (filter: FilterName) => void
}

export function FilterPicker({ selected, photo, onSelect }: FilterPickerProps) {
  const t = useTranslation()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const updateScrollHints = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    setCanScrollLeft(scroller.scrollLeft > 1)
    setCanScrollRight(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1)
  }, [])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    updateScrollHints()
    const resizeObserver = new ResizeObserver(updateScrollHints)
    resizeObserver.observe(scroller)
    return () => resizeObserver.disconnect()
  }, [updateScrollHints])

  const labels: Record<FilterName, string> = {
    none: t.filterPicker.none,
    warmFilm: t.filterPicker.warmFilm,
    coolFilm: t.filterPicker.coolFilm,
    vintagePositive: t.filterPicker.vintagePositive,
    monochrome: t.filterPicker.monochrome,
    softFade: t.filterPicker.softFade,
    vivid: t.filterPicker.vivid,
    tealOrange: t.filterPicker.tealOrange,
  }
  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        data-filter-scroller
        onScroll={updateScrollHints}
        className="flex w-full gap-4 overflow-x-auto pb-2"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => onSelect(filter)}
            aria-pressed={selected === filter}
            className={`type-caption flex min-w-24 flex-col items-center gap-2 rounded-xl border bg-surface-container-lowest p-1.5 pb-3 transition-all ${
              selected === filter
                ? 'border-primary-container text-primary shadow-sm'
                : 'border-outline-variant/30 text-on-surface-variant opacity-75 hover:opacity-100'
            }`}
          >
            <span className="overflow-hidden rounded-lg [&_canvas]:block [&_canvas]:h-20 [&_canvas]:w-20">
              <FilterThumbnail photo={photo} filter={filter} />
            </span>
            {labels[filter]}
          </button>
        ))}
      </div>
      <div
        data-testid="filter-fade-left"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-surface-container-low to-transparent transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        data-testid="filter-fade-right"
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-surface-container-low to-transparent transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
