import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the headline and format hint', () => {
    render(<EmptyState onFileSelected={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '给照片，配一套颜色。' })).toBeInTheDocument()
    expect(screen.getByText('本地解析支持 JPG / PNG / WEBP / HEIF / HEIC')).toBeInTheDocument()
  })

  it('forwards the selected file to onFileSelected via the upload zone', () => {
    const onFileSelected = vi.fn()
    render(<EmptyState onFileSelected={onFileSelected} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input')
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFileSelected).toHaveBeenCalledWith(file)
  })
})
