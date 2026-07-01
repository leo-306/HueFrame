import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPicker } from './FilterPicker'

describe('FilterPicker', () => {
  it('renders an option for each filter', () => {
    render(<FilterPicker selected="none" onSelect={vi.fn()} />)
    expect(screen.getByText('无滤镜')).toBeInTheDocument()
    expect(screen.getByText('暖调胶片')).toBeInTheDocument()
    expect(screen.getByText('冷调胶片')).toBeInTheDocument()
    expect(screen.getByText('复古正片')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked filter name', () => {
    const onSelect = vi.fn()
    render(<FilterPicker selected="none" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('暖调胶片'))

    expect(onSelect).toHaveBeenCalledWith('warmFilm')
  })
})
