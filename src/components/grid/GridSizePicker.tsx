import { useState } from 'react'
import { GRID_PRESETS, clampGridSize } from '../../lib/gridLayout'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface GridSize {
  rows: number
  cols: number
}

interface GridSizePickerProps {
  rows: number
  cols: number
  onChange: (size: GridSize) => void
}

const CLAMP_HINT = '已调整为 1-6 之间'

export function GridSizePicker({ rows, cols, onChange }: GridSizePickerProps) {
  const [showClampHint, setShowClampHint] = useState(false)
  const isPresetSelected = (presetRows: number, presetCols: number) => rows === presetRows && cols === presetCols

  const handleCustomChange = (rawValue: number, dimension: 'rows' | 'cols') => {
    const clamped = clampGridSize(rawValue)
    setShowClampHint(clamped !== rawValue)
    onChange(dimension === 'rows' ? { rows: clamped, cols } : { rows, cols: clamped })
  }

  return (
    <div className="my-3">
      <div className="flex flex-wrap gap-2">
        {GRID_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            variant={isPresetSelected(preset.rows, preset.cols) ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onChange({ rows: preset.rows, cols: preset.cols })}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="grid-custom-rows">自定义行数</Label>
          <Input
            id="grid-custom-rows"
            type="number"
            min={1}
            max={6}
            value={rows}
            className="w-16"
            onChange={(e) => handleCustomChange(Number(e.target.value), 'rows')}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Label htmlFor="grid-custom-cols">自定义列数</Label>
          <Input
            id="grid-custom-cols"
            type="number"
            min={1}
            max={6}
            value={cols}
            className="w-16"
            onChange={(e) => handleCustomChange(Number(e.target.value), 'cols')}
          />
        </div>
      </div>

      {showClampHint && <p className="mt-1.5 text-xs text-on-surface-variant">{CLAMP_HINT}</p>}
    </div>
  )
}
