import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportButton } from './ExportButton'

describe('ExportButton', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() })
  })

  it('triggers canvas.toBlob when clicked', () => {
    const canvas = document.createElement('canvas')
    const toBlobSpy = vi.spyOn(canvas, 'toBlob').mockImplementation((cb) => {
      cb!(new Blob(['fake'], { type: 'image/png' }))
    })

    render(<ExportButton canvas={canvas} fileName="card.png" />)
    fireEvent.click(screen.getByText('导出 PNG'))

    expect(toBlobSpy).toHaveBeenCalled()
  })

  it('sits above the fixed tool navigation', () => {
    render(<ExportButton canvas={null} fileName="card.png" />)
    expect(screen.getByText('导出 PNG').parentElement?.parentElement).toHaveClass(
      'bottom-[calc(4.5rem+env(safe-area-inset-bottom))]'
    )
  })
})
