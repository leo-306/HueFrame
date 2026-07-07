import type { ReactNode } from 'react'
import { Minus, Palette, Plus, RefreshCw, ScanLine } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface NumberStepperProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function NumberStepper({ label, value, min, max, onChange }: NumberStepperProps) {
  const t = useTranslation()
  const clamp = (next: number) => Math.min(max, Math.max(min, next))

  return (
    <div>
      <label className="type-caption mb-2 block text-on-surface-variant" htmlFor={`stepper-${label}`}>
        {label}
      </label>
      <div className="flex h-11 items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-2">
        <Input
          id={`stepper-${label}`}
          type="number"
          aria-label={label}
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) onChange(clamp(next))
          }}
          className="h-9 border-0 px-1 shadow-none focus-visible:ring-0"
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
        <span className="type-caption ml-1 text-on-surface-variant">px</span>
      </div>
    </div>
  )
}

interface PaletteControlsProps {
  children: ReactNode
  marginPx: number
  swatchGapPx: number
  swatchRadiusPx: number
  isExtracting?: boolean
  onReextract: () => void
  onMarginChange: (value: number) => void
  onSwatchGapChange: (value: number) => void
  onSwatchRadiusChange: (value: number) => void
}

export function PaletteControls({
  children,
  marginPx,
  swatchGapPx,
  swatchRadiusPx,
  isExtracting = false,
  onReextract,
  onMarginChange,
  onSwatchGapChange,
  onSwatchRadiusChange,
}: PaletteControlsProps) {
  const t = useTranslation()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="type-body flex items-center gap-2 font-medium text-on-surface">
          <Palette className="size-5 text-primary" />
          {t.cardTabs.colorEditor}
        </h3>
        <Button type="button" variant="outline" onClick={onReextract} disabled={isExtracting}>
          <RefreshCw className={isExtracting ? 'animate-spin' : ''} />
          {isExtracting ? t.cardTabs.reextractingColors : t.cardTabs.reextractColors}
        </Button>
      </div>

      {children}

      <div className="border-t border-outline-variant/40 pt-5">
        <h3 className="type-body mb-4 flex items-center gap-2 font-medium text-on-surface">
          <ScanLine className="size-5 text-primary" />
          {t.cardTabs.spacingAndWhitespace}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberStepper label={t.cardTabs.cardPadding} value={marginPx} min={0} max={80} onChange={onMarginChange} />
          <NumberStepper label={t.cardTabs.swatchGap} value={swatchGapPx} min={0} max={48} onChange={onSwatchGapChange} />
          <NumberStepper label={t.cardTabs.swatchRadius} value={swatchRadiusPx} min={0} max={24} onChange={onSwatchRadiusChange} />
        </div>
      </div>
    </div>
  )
}
