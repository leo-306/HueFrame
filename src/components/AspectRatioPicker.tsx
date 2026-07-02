import { ASPECT_RATIOS, type AspectRatioId } from '../lib/aspectRatio'

interface AspectRatioPickerProps {
  selected: AspectRatioId
  onSelect: (ratio: AspectRatioId) => void
}

export function AspectRatioPicker({ selected, onSelect }: AspectRatioPickerProps) {
  return (
    <div className="btn-group">
      {ASPECT_RATIOS.map((ratio) => (
        <button key={ratio} className="btn" onClick={() => onSelect(ratio)} aria-pressed={selected === ratio}>
          {ratio}
        </button>
      ))}
    </div>
  )
}
