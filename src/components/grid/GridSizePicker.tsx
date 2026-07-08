import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { GRID_PRESETS } from '../../lib/gridLayout'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
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
  const [showCustom, setShowCustom] = useState(false)
  const isPresetSelected = (presetRows: number, presetCols: number) => rows === presetRows && cols === presetCols

  return (
    <div>
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
          <div className="grid grid-cols-2 gap-5">
            {[
              {
                id: 'grid-custom-rows',
                label: t.gridSizePicker.customRows,
                value: rows,
                onValueChange: (value: number) => onChange({ rows: value, cols }),
              },
              {
                id: 'grid-custom-cols',
                label: t.gridSizePicker.customCols,
                value: cols,
                onValueChange: (value: number) => onChange({ rows, cols: value }),
              },
            ].map(({ id, label, value, onValueChange }) => (
              <div key={id} className="min-w-0">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="type-caption truncate text-on-surface-variant">
                    {label}
                  </span>
                  <span className="type-caption min-w-6 rounded-full bg-surface-container-high px-2 py-0.5 text-center font-medium tabular-nums text-on-surface">
                    {value}
                  </span>
                </div>
                <Slider
                  id={id}
                  aria-label={label}
                  min={1}
                  max={10}
                  step={1}
                  value={[value]}
                  onValueChange={([next]) => onValueChange(next)}
                />
                <div className="type-caption mt-1.5 flex justify-between text-outline">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
