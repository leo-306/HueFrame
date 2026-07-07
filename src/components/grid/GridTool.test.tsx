import { useState } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridTool, type GridSubTab } from './GridTool'
import { GridSubTabSwitcher } from './GridSubTabSwitcher'
import { installMockUploadImage } from '../../../tests/mockUploadImage'

function GridToolWithSwitcher({ onGenerateCard, initialFile }: { onGenerateCard: (canvas: HTMLCanvasElement) => void; initialFile?: File }) {
  const [activeSubTab, setActiveSubTab] = useState<GridSubTab>('split')
  return (
    <>
      <GridSubTabSwitcher value={activeSubTab} onChange={setActiveSubTab} />
      <GridTool activeSubTab={activeSubTab} onGenerateCard={onGenerateCard} initialFile={initialFile} />
    </>
  )
}

describe('GridTool', () => {
  let restoreMockImage: () => void

  beforeEach(() => {
    restoreMockImage = installMockUploadImage()
  })

  afterEach(() => {
    restoreMockImage()
  })

  it('renders the split panel by default', () => {
    const { container } = render(<GridTool activeSubTab="split" onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
    expect(container.querySelector('[data-slot="tabs"]')).toHaveClass('w-full')
    expect(container.querySelector('[data-slot="tabs"]')).not.toHaveClass('px-5')
  })

  it('renders the collage panel when activeSubTab is collage', () => {
    render(<GridTool activeSubTab="collage" onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传多张照片/)).toBeInTheDocument()
  })

  it('renders both sub-tab labels in the switcher', () => {
    render(<GridSubTabSwitcher value="split" onChange={vi.fn()} />)
    expect(screen.getByText('切分')).toBeInTheDocument()
    expect(screen.getByText('拼图')).toBeInTheDocument()
  })

  it('switches to the collage panel when the 拼图 tab is clicked', async () => {
    const user = userEvent.setup()
    render(<GridToolWithSwitcher onGenerateCard={vi.fn()} />)

    await user.click(screen.getByText('拼图'))

    expect(screen.getByText(/上传多张照片/)).toBeInTheDocument()
  })

  it('keeps split panel state when switching away and back to it', async () => {
    const user = userEvent.setup()
    render(<GridToolWithSwitcher onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByText('拼图'))
    await user.click(screen.getByText('切分'))

    expect(screen.queryByText(/上传一张照片/)).not.toBeInTheDocument()
  })

  it('passes initialFile through to the split panel', async () => {
    const file = new File(['dummy'], 'from-home.jpg', { type: 'image/jpeg' })
    render(<GridTool activeSubTab="split" onGenerateCard={vi.fn()} initialFile={file} />)

    await waitFor(() => expect(screen.getByRole('button', { name: '3×3' })).toBeInTheDocument())
  })
})
