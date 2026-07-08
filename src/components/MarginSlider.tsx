import { Slider } from './ui/slider'
import { useTranslation } from '../i18n/LocaleContext'

interface MarginSliderProps {
  id?: string
  label?: string
  valuePx: number
  onChange: (valuePx: number) => void
  min?: number
  max?: number
}

export function MarginSlider({ id = 'margin-slider', label, valuePx, onChange, min = 0, max = 80 }: MarginSliderProps) {
  const t = useTranslation()
  const sliderLabel = label ?? t.marginSlider.label
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="type-caption text-on-surface-variant" htmlFor={id}>
          {sliderLabel}
        </label>
        <span className="type-label font-medium tabular-nums text-on-surface">{valuePx}px</span>
      </div>
      <Slider
        id={id}
        aria-label={sliderLabel}
        min={min}
        max={max}
        value={[valuePx]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
