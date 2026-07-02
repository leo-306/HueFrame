import { useEffect, useRef } from 'react'
import { FILTERS, createFilterThumbnail, type FilterName } from '../lib/filters'

const LABELS: Record<FilterName, string> = {
  none: '无滤镜',
  warmFilm: '暖调胶片',
  coolFilm: '冷调胶片',
  vintagePositive: '复古正片',
}

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
  return (
    <div>
      {FILTERS.map((filter) => (
        <button key={filter} onClick={() => onSelect(filter)} aria-pressed={selected === filter}>
          <FilterThumbnail photo={photo} filter={filter} />
          {LABELS[filter]}
        </button>
      ))}
    </div>
  )
}
