import { useState } from 'react'
import { ChevronDown, Grid3X3 } from 'lucide-react'
import { GRID_PRESETS, clampGridSize } from '../../lib/gridLayout'
import { Button } from '../ui/button'
import { NumberStepper } from '../NumberStepper'
import { useTranslation } from '../../i18n/LocaleContext'

interface GridSize {
  rows: number
  cols: number
}

interface GridSizePickerProps {
  rows: number
  cols: number
  onChange: (size: GridSize) => void
}

export function GridSizePicker({ rows, cols, onChange }: GridSizePickerProps) {
  const t = useTranslation()
  const [showClampHint, setShowClampHint] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const isPresetSelected = (presetRows: number, presetCols: number) => rows === presetRows && cols === presetCols

  const handleCustomChange = (rawValue: number, dimension: 'rows' | 'cols', wasClamped = false) => {
    const clamped = clampGridSize(rawValue)
    setShowClampHint(wasClamped || clamped !== rawValue)
    onChange(dimension === 'rows' ? { rows: clamped, cols } : { rows, cols: clamped })
  }

  return (
    <div>
      <h3 className="type-body mb-4 flex items-center gap-2 font-medium text-on-surface">
        <Grid3X3 className="size-5 text-primary" />
        {t.gridSizePicker.title}
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {GRID_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant="outline"
            aria-label={preset.label}
            title={preset.label}
            className={`min-h-12 w-full shadow-none ${
              isPresetSelected(preset.rows, preset.cols)
                ? 'border-primary/20 bg-primary-container/70 text-primary'
                : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant'
            }`}
            onClick={() => onChange({ rows: preset.rows, cols: preset.cols })}
          >
            <span
              aria-hidden="true"
              className="grid place-self-center gap-0.5"
              style={{
                gridTemplateColumns: `repeat(${preset.cols}, 6px)`,
                gridTemplateRows: `repeat(${preset.rows}, 6px)`,
              }}
            >
              {Array.from({ length: preset.rows * preset.cols }, (_, index) => (
                <span key={index} className="rounded-[1px] bg-current" />
              ))}
            </span>
          </Button>
        ))}
      </div>

      <button
        type="button"
        aria-expanded={showCustom}
        onClick={() => setShowCustom((current) => !current)}
        className="type-caption mt-4 flex min-h-9 w-full items-center justify-between border-0 bg-transparent px-1 text-on-surface-variant"
      >
        {t.gridSizePicker.advanced}
        <ChevronDown className={`size-4 ${showCustom ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {showCustom && (
        <div className="mt-3 border-t border-outline-variant/40 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberStepper id="grid-custom-rows" label={t.gridSizePicker.customRows} value={rows} min={1} max={6} onChange={(value, wasClamped) => handleCustomChange(value, 'rows', wasClamped)} />
            <NumberStepper id="grid-custom-cols" label={t.gridSizePicker.customCols} value={cols} min={1} max={6} onChange={(value, wasClamped) => handleCustomChange(value, 'cols', wasClamped)} />
          </div>
          {showClampHint && <p className="mt-1.5 text-xs text-on-surface-variant">{t.gridSizePicker.clampHint}</p>}
        </div>
      )}
    </div>
  )
}
