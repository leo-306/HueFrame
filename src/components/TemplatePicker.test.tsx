import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TemplatePicker, type TemplateId } from './TemplatePicker'

describe('TemplatePicker', () => {
  it('renders both template options', () => {
    render(<TemplatePicker selected="classicStrip" onSelect={vi.fn()} />)
    expect(screen.getByText('全部模板')).toBeInTheDocument()
    expect(screen.getByText('经典色带')).toBeInTheDocument()
    expect(screen.getByText('杂志封面')).toBeInTheDocument()
  })

  it('calls onSelect with the clicked template id', () => {
    const onSelect = vi.fn()
    render(<TemplatePicker selected="classicStrip" onSelect={onSelect} />)

    fireEvent.click(screen.getByText('杂志封面'))

    expect(onSelect).toHaveBeenCalledWith('magazineCover' as TemplateId)
  })
})
