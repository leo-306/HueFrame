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
  return (
    <div>
      <div className="type-body mb-4 flex items-center justify-between text-on-surface-variant">
        <label htmlFor={id}>{label ?? t.marginSlider.label}</label>
        <span>{valuePx}px</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        value={[valuePx]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
