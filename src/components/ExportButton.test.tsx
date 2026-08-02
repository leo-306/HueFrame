import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportButton } from './ExportButton'

describe('ExportButton', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() })
  })

  it('saves the card image through a mounted link and delays URL cleanup', async () => {
    const canvas = document.createElement('canvas')
    const toBlobSpy = vi.spyOn(canvas, 'toBlob').mockImplementation((cb) => {
      cb!(new Blob(['fake'], { type: 'image/png' }))
    })
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    const removeSpy = vi.spyOn(HTMLAnchorElement.prototype, 'remove')
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const timeoutSpy = vi.spyOn(window, 'setTimeout').mockImplementation((callback) => {
      if (typeof callback === 'function') callback()
      return 1 as unknown as ReturnType<typeof setTimeout>
    })

    render(<ExportButton canvas={canvas} fileName="card.png" onFilesReplaced={vi.fn()} />)
    const saveButton = screen.getByText('保存到相册').closest('button')
    expect(saveButton).toHaveClass('bg-[#2f7d68]', 'text-white')
    expect(saveButton).not.toBeDisabled()
    fireEvent.click(saveButton!)
    await Promise.resolve()
    await Promise.resolve()

    expect(toBlobSpy).toHaveBeenCalled()
    expect(appendSpy).toHaveBeenCalledWith(expect.any(HTMLAnchorElement))
    expect(clickSpy).toHaveBeenCalledOnce()
    expect(removeSpy).toHaveBeenCalledOnce()
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1_000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock')
  })

  it('sits above the fixed tool navigation', () => {
    render(<ExportButton canvas={null} fileName="card.png" onFilesReplaced={vi.fn()} />)
    const actionBar = screen.getByText('保存到相册').closest('button')?.parentElement?.parentElement
    expect(actionBar).toHaveClass('bottom-[calc(4.5rem+env(safe-area-inset-bottom))]', 'py-2')
  })

  it('supports replacing the source photo from the bottom action bar', () => {
    const onFilesReplaced = vi.fn()
    render(<ExportButton canvas={null} fileName="card.png" onFilesReplaced={onFilesReplaced} />)

    const file = new File(['replacement'], 'replacement.jpg', { type: 'image/jpeg' })
    fireEvent.change(screen.getByTestId('replace-upload-input'), { target: { files: [file] } })

    expect(onFilesReplaced).toHaveBeenCalledWith([file])
  })

  it('supports an optional secondary action in the bottom action bar', () => {
    const onSecondaryAction = vi.fn()
    render(
      <ExportButton
        canvas={null}
        fileName="grid.png"
        saveLabel="导出图片"
        onFilesReplaced={vi.fn()}
        secondaryLabel="导入到色卡"
        onSecondaryAction={onSecondaryAction}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: '导入到色卡' }))
    expect(onSecondaryAction).toHaveBeenCalledOnce()
  })
})
