import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { UploadZone } from './UploadZone'

describe('UploadZone', () => {
  it('calls onFileSelected when a file is chosen via the input', () => {
    const onFileSelected = vi.fn()
    render(<UploadZone onFileSelected={onFileSelected} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileSelected).toHaveBeenCalledWith(file)
  })

  it('renders prompt text when no file is selected', () => {
    render(<UploadZone onFileSelected={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
  })
})
