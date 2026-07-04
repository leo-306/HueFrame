import { ASPECT_RATIOS, type AspectRatioId } from '../lib/aspectRatio'
import { Button } from './ui/button'
import { useTranslation } from '../i18n/LocaleContext'

interface AspectRatioPickerProps {
  selected: AspectRatioId
  onSelect: (ratio: AspectRatioId) => void
}

export function AspectRatioPicker({ selected, onSelect }: AspectRatioPickerProps) {
  const t = useTranslation()
  return (
    <div className="mb-7">
      <div className="type-body mb-3 text-on-surface-variant">{t.layoutControls.aspectRatio}</div>
      <div className="grid grid-cols-3 gap-3">
        {ASPECT_RATIOS.map((ratio) => (
          <Button
            key={ratio}
            variant={selected === ratio ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onSelect(ratio)}
            aria-pressed={selected === ratio}
            className="h-12 bg-surface"
          >
            {ratio}
          </Button>
        ))}
      </div>
    </div>
  )
}
