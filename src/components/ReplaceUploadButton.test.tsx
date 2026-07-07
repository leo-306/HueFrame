import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ReplaceUploadButton } from './ReplaceUploadButton'

describe('ReplaceUploadButton', () => {
  it('forwards selected files and allows selecting the same file again', () => {
    const onFilesSelected = vi.fn()
    render(<ReplaceUploadButton onFilesSelected={onFilesSelected} />)

    const file = new File(['replacement'], 'replacement.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('replace-upload-input') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    expect(onFilesSelected).toHaveBeenCalledWith([file])
    expect(input.value).toBe('')
  })
})
