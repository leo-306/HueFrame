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
  return (
    <div>
      <div className="form-field">
        <label htmlFor="location-input">地点</label>
        <input
          id="location-input"
          type="text"
          value={locationName}
          onChange={(e) => onLocationChange(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="captured-at-input">时间</label>
        <input
          id="captured-at-input"
          type="text"
          value={capturedAtText}
          onChange={(e) => onCapturedAtChange(e.target.value)}
        />
      </div>

      <div className="form-field watermark-toggle">
        <input
          id="watermark-toggle"
          type="checkbox"
          checked={watermarkEnabled}
          onChange={(e) => onWatermarkToggle(e.target.checked)}
        />
        <label htmlFor="watermark-toggle">HueFrame 水印</label>
      </div>
    </div>
  )
}
