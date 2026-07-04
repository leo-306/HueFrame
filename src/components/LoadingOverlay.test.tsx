import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingOverlay } from './LoadingOverlay'

describe('LoadingOverlay', () => {
  it('renders an accessible full-screen loading status by default', () => {
    render(<LoadingOverlay label="处理中…" />)
    const loading = screen.getByRole('status')
    expect(loading).toHaveTextContent('处理中…')
    expect(loading).toHaveAttribute('aria-live', 'polite')
    expect(loading).toHaveAttribute('aria-busy', 'true')
    expect(loading).toHaveClass('fixed')
  })

  it('can be scoped to a positioned container', () => {
    render(<LoadingOverlay label="正在生成" mode="container" />)
    expect(screen.getByRole('status')).toHaveClass('absolute')
  })
})
