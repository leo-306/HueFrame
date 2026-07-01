import { FILTERS, type FilterName } from '../lib/filters'

const LABELS: Record<FilterName, string> = {
  none: '无滤镜',
  warmFilm: '暖调胶片',
  coolFilm: '冷调胶片',
  vintagePositive: '复古正片',
}

interface FilterPickerProps {
  selected: FilterName
  onSelect: (filter: FilterName) => void
}

export function FilterPicker({ selected, onSelect }: FilterPickerProps) {
  return (
    <div>
      {FILTERS.map((filter) => (
        <button key={filter} onClick={() => onSelect(filter)} aria-pressed={selected === filter}>
          {LABELS[filter]}
        </button>
      ))}
    </div>
  )
}
