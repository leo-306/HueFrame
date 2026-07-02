interface MarginSliderProps {
  valuePx: number
  onChange: (valuePx: number) => void
  min?: number
  max?: number
}

export function MarginSlider({ valuePx, onChange, min = 0, max = 80 }: MarginSliderProps) {
  return (
    <div>
      <label htmlFor="margin-slider">留白 (Margin)</label>
      <input
        id="margin-slider"
        type="range"
        min={min}
        max={max}
        value={valuePx}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span>{valuePx}px</span>
    </div>
  )
}
