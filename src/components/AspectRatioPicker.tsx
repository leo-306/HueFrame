import { ASPECT_RATIOS, type AspectRatioId } from '../lib/aspectRatio'
import { Button } from './ui/button'

interface AspectRatioPickerProps {
  selected: AspectRatioId
  onSelect: (ratio: AspectRatioId) => void
}

export function AspectRatioPicker({ selected, onSelect }: AspectRatioPickerProps) {
  return (
    <div className="my-3 flex flex-wrap gap-2">
      {ASPECT_RATIOS.map((ratio) => (
        <Button
          key={ratio}
          variant={selected === ratio ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onSelect(ratio)}
          aria-pressed={selected === ratio}
        >
          {ratio}
        </Button>
      ))}
    </div>
  )
}
