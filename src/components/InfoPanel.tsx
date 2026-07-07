import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { Slider } from './ui/slider'
import { useTranslation } from '../i18n/LocaleContext'
import { CalendarDays, MapPin, Stamp } from 'lucide-react'

interface InfoPanelProps {
  locationName: string
  capturedAtText: string
  watermarkEnabled: boolean
  watermarkOpacity: number
  onLocationChange: (value: string) => void
  onCapturedAtChange: (value: string) => void
  onWatermarkToggle: (enabled: boolean) => void
  onWatermarkOpacityChange: (opacity: number) => void
}

export function InfoPanel({
  locationName,
  capturedAtText,
  watermarkEnabled,
  watermarkOpacity,
  onLocationChange,
  onCapturedAtChange,
  onWatermarkToggle,
  onWatermarkOpacityChange,
}: InfoPanelProps) {
  const t = useTranslation()
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="mb-5 flex items-center gap-2.5 text-on-surface">
          <MapPin className="size-5 text-primary" aria-hidden="true" />
          <h3 className="type-body m-0 font-semibold">{t.infoPanel.location}</h3>
        </div>
        <Input
          id="location-input"
          type="text"
          aria-label={t.infoPanel.location}
          value={locationName}
          onChange={(e) => onLocationChange(e.target.value)}
          className="h-11 border-outline-variant/70 bg-surface-container-low px-3.5 shadow-none"
        />

        <div className="mt-5 mb-3 flex items-center gap-2.5 text-on-surface">
          <CalendarDays className="size-5 text-primary" aria-hidden="true" />
          <Label htmlFor="captured-at-input" className="type-body font-semibold">
            {t.infoPanel.capturedAt}
          </Label>
        </div>
        <Input
          id="captured-at-input"
          type="text"
          value={capturedAtText}
          onChange={(e) => onCapturedAtChange(e.target.value)}
          className="h-11 border-outline-variant/70 bg-surface-container-low px-3.5 shadow-none"
        />
      </section>

      <section className="rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Stamp className="size-5 text-primary" aria-hidden="true" />
            <Label htmlFor="watermark-toggle" className="type-body font-semibold">
              {t.infoPanel.watermark}
            </Label>
          </div>
          <Checkbox
            id="watermark-toggle"
            checked={watermarkEnabled}
            onCheckedChange={(checked) => onWatermarkToggle(checked === true)}
          />
        </div>

        <div className="mt-5 rounded-lg bg-surface-container-low p-4">
          <div className="type-label mb-4 flex items-center justify-between text-on-surface-variant">
            <label htmlFor="watermark-opacity-slider">{t.infoPanel.watermarkOpacity}</label>
            <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 font-medium text-on-surface">
              {watermarkOpacity}%
            </span>
          </div>
          <Slider
            id="watermark-opacity-slider"
            min={0}
            max={100}
            value={[watermarkOpacity]}
            disabled={!watermarkEnabled}
            onValueChange={([next]) => onWatermarkOpacityChange(next)}
          />
        </div>
      </section>
    </div>
  )
}
