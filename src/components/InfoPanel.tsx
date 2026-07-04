import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { useTranslation } from '../i18n/LocaleContext'

interface InfoPanelProps {
  locationName: string
  capturedAtText: string
  watermarkEnabled: boolean
  onLocationChange: (value: string) => void
  onCapturedAtChange: (value: string) => void
  onWatermarkToggle: (enabled: boolean) => void
}

export function InfoPanel({
  locationName,
  capturedAtText,
  watermarkEnabled,
  onLocationChange,
  onCapturedAtChange,
  onWatermarkToggle,
}: InfoPanelProps) {
  const t = useTranslation()
  return (
    <div>
      <div className="mb-4">
        <Label htmlFor="location-input" className="type-label mb-1.5 text-on-surface-variant">
          {t.infoPanel.location}
        </Label>
        <Input
          id="location-input"
          type="text"
          value={locationName}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="captured-at-input" className="type-label mb-1.5 text-on-surface-variant">
          {t.infoPanel.capturedAt}
        </Label>
        <Input
          id="captured-at-input"
          type="text"
          value={capturedAtText}
          onChange={(e) => onCapturedAtChange(e.target.value)}
        />
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <Checkbox
          id="watermark-toggle"
          checked={watermarkEnabled}
          onCheckedChange={(checked) => onWatermarkToggle(checked === true)}
        />
        <Label htmlFor="watermark-toggle">{t.infoPanel.watermark}</Label>
      </div>
    </div>
  )
}
