import type { ReactNode } from 'react'
import { Palette, RefreshCw, ScanLine } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { Button } from './ui/button'
import { NumberStepper } from './NumberStepper'

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
          <NumberStepper id="card-padding" label={t.cardTabs.cardPadding} value={marginPx} min={0} max={80} unit="px" onChange={onMarginChange} />
          <NumberStepper id="swatch-gap" label={t.cardTabs.swatchGap} value={swatchGapPx} min={0} max={48} unit="px" onChange={onSwatchGapChange} />
          <NumberStepper id="swatch-radius" label={t.cardTabs.swatchRadius} value={swatchRadiusPx} min={0} max={24} unit="px" onChange={onSwatchRadiusChange} />
        </div>
      </div>
    </div>
  )
}
