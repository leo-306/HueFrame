import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AspectRatioPicker } from './AspectRatioPicker'

describe('AspectRatioPicker', () => {
  it('renders all three ratio options', () => {
    render(<AspectRatioPicker selected="4:5" onSelect={vi.fn()} />)
    expect(screen.getByText('4:5')).toBeInTheDocument()
    expect(screen.getByText('1:1')).toBeInTheDocument()
    expect(screen.getByText('16:9')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked ratio', () => {
    const onSelect = vi.fn()
    render(<AspectRatioPicker selected="4:5" onSelect={onSelect} />)
    fireEvent.click(screen.getByText('1:1'))
    expect(onSelect).toHaveBeenCalledWith('1:1')
  })

  it('marks the selected ratio as pressed', () => {
    render(<AspectRatioPicker selected="16:9" onSelect={vi.fn()} />)
    expect(screen.getByText('16:9')).toHaveAttribute('aria-pressed', 'true')
  })
})
