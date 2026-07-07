import { Minus, Plus } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface NumberStepperProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  unit?: string
  onChange: (value: number, wasClamped?: boolean) => void
}

export function NumberStepper({ id, label, value, min, max, unit, onChange }: NumberStepperProps) {
  const t = useTranslation()
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div>
      <label className="type-caption mb-2 block text-on-surface-variant" htmlFor={id}>
        {label}
      </label>
      <div className="flex h-11 items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-2">
        <Input
          id={id}
          type="number"
          aria-label={label}
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) {
              const clamped = clamp(next)
              if (clamped !== next) onChange(clamped, true)
              else onChange(clamped)
            }
          }}
          className="h-9 min-w-0 border-0 px-1 shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`${t.cardTabs.decrease}${label}`}
          disabled={value <= min}
          onClick={() => onChange(clamp(value - 1))}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`${t.cardTabs.increase}${label}`}
          disabled={value >= max}
          onClick={() => onChange(clamp(value + 1))}
        >
          <Plus />
        </Button>
        {unit && <span className="type-caption ml-1 text-on-surface-variant">{unit}</span>}
      </div>
    </div>
  )
}
