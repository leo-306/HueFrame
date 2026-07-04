import { Slider } from './ui/slider'

interface MarginSliderProps {
  valuePx: number
  onChange: (valuePx: number) => void
  min?: number
  max?: number
}

export function MarginSlider({ valuePx, onChange, min = 0, max = 80 }: MarginSliderProps) {
  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-center justify-between text-[13px] tracking-wide text-on-surface-variant">
        <label htmlFor="margin-slider">留白 (Margin)</label>
        <span>{valuePx}px</span>
      </div>
      <Slider
        id="margin-slider"
        min={min}
        max={max}
        value={[valuePx]}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  )
}
