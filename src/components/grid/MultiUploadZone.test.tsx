import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MultiUploadZone } from './MultiUploadZone'

describe('MultiUploadZone', () => {
  it('calls onFilesSelected with all chosen files', () => {
    const onFilesSelected = vi.fn()
    render(<MultiUploadZone onFilesSelected={onFilesSelected} />)

    const fileA = new File(['a'], 'a.jpg', { type: 'image/jpeg' })
    const fileB = new File(['b'], 'b.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement

    fireEvent.change(input, { target: { files: [fileA, fileB] } })

    expect(onFilesSelected).toHaveBeenCalledWith([fileA, fileB])
  })

  it('renders prompt text when no files are selected', () => {
    render(<MultiUploadZone onFilesSelected={vi.fn()} />)
    expect(screen.getByText(/上传多张照片开始/)).toBeInTheDocument()
  })

  it('marks the file input as accepting multiple files', () => {
    render(<MultiUploadZone onFilesSelected={vi.fn()} />)
    const input = screen.getByTestId('grid-upload-input') as HTMLInputElement
    expect(input.multiple).toBe(true)
    expect(input.accept).toContain('.heic')
    expect(input.accept).toContain('.heif')
  })
})
