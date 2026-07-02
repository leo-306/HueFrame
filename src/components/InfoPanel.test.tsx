import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InfoPanel } from './InfoPanel'

describe('InfoPanel', () => {
  it('displays the current location and captured-at text', () => {
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled
        onLocationChange={vi.fn()}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={vi.fn()}
      />
    )
    expect(screen.getByDisplayValue('Kyoto, Japan')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026-04-10')).toBeInTheDocument()
  })

  it('calls onLocationChange when the location input is edited', () => {
    const onLocationChange = vi.fn()
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled
        onLocationChange={onLocationChange}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={vi.fn()}
      />
    )
    fireEvent.change(screen.getByLabelText('地点'), { target: { value: 'Osaka, Japan' } })
    expect(onLocationChange).toHaveBeenCalledWith('Osaka, Japan')
  })

  it('calls onWatermarkToggle with the checkbox state', () => {
    const onWatermarkToggle = vi.fn()
    render(
      <InfoPanel
        locationName="Kyoto, Japan"
        capturedAtText="2026-04-10"
        watermarkEnabled={false}
        onLocationChange={vi.fn()}
        onCapturedAtChange={vi.fn()}
        onWatermarkToggle={onWatermarkToggle}
      />
    )
    fireEvent.click(screen.getByLabelText('HueFrame 水印'))
    expect(onWatermarkToggle).toHaveBeenCalledWith(true)
  })
})
