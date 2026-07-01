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
    fireEvent.click(screen.getByText('导出图片'))

    expect(toBlobSpy).toHaveBeenCalled()
  })
})
