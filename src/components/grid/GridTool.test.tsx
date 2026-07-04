import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridTool } from './GridTool'
import { installMockUploadImage } from '../../../tests/mockUploadImage'

describe('GridTool', () => {
  let restoreMockImage: () => void

  beforeEach(() => {
    restoreMockImage = installMockUploadImage()
  })

  afterEach(() => {
    restoreMockImage()
  })

  it('renders the split panel by default', () => {
    render(<GridTool onGenerateCard={vi.fn()} />)
    expect(screen.getByText(/上传一张照片/)).toBeInTheDocument()
  })

  it('renders both sub-tab labels', () => {
    render(<GridTool onGenerateCard={vi.fn()} />)
    expect(screen.getByText('切分')).toBeInTheDocument()
    expect(screen.getByText('拼图')).toBeInTheDocument()
  })

  it('switches to the collage panel when the 拼图 tab is clicked', async () => {
    const user = userEvent.setup()
    render(<GridTool onGenerateCard={vi.fn()} />)

    await user.click(screen.getByText('拼图'))

    expect(screen.getByText(/上传多张照片/)).toBeInTheDocument()
  })

  it('keeps split panel state when switching away and back to it', async () => {
    const user = userEvent.setup()
    render(<GridTool onGenerateCard={vi.fn()} />)

    const file = new File(['dummy'], 'trip.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('upload-input') as HTMLInputElement
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(input, { target: { files: [file] } })

    await user.click(screen.getByText('拼图'))
    await user.click(screen.getByText('切分'))

    expect(screen.queryByText(/上传一张照片/)).not.toBeInTheDocument()
  })
})
