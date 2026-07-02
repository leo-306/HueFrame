import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPicker } from './FilterPicker'
import { createTestPhoto } from '../../tests/testImage'

describe('FilterPicker', () => {
  it('renders an option for each filter', () => {
    render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={vi.fn()} />)
    expect(screen.getByText('无滤镜')).toBeInTheDocument()
    expect(screen.getByText('暖调胶片')).toBeInTheDocument()
    expect(screen.getByText('冷调胶片')).toBeInTheDocument()
    expect(screen.getByText('复古正片')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked filter name', () => {
    const onSelect = vi.fn()
    render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={onSelect} />)

    fireEvent.click(screen.getByText('暖调胶片'))

    expect(onSelect).toHaveBeenCalledWith('warmFilm')
  })

  it('renders a thumbnail canvas for each filter option', () => {
    const { container } = render(<FilterPicker selected="none" photo={createTestPhoto()} onSelect={vi.fn()} />)
    const canvases = container.querySelectorAll('canvas')
    expect(canvases.length).toBe(4)
  })
})
