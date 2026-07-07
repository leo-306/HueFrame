import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopBar } from './TopBar'
import { LocaleProvider } from '../i18n/LocaleContext'

describe('TopBar', () => {
  it('renders the HueFrame title', () => {
    render(<TopBar />)
    expect(screen.getByText('映色格')).toHaveClass('hueframe-brand')
  })

  it('switches the title to English with the interface locale', () => {
    window.localStorage.clear()
    render(
      <LocaleProvider>
        <TopBar />
      </LocaleProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: '切换界面语言' }))
    expect(screen.getByText('HUEFRAME')).toBeInTheDocument()
  })

  it('does not render a back button on the home page', () => {
    render(<TopBar />)
    expect(screen.queryByRole('button', { name: '返回首页' })).not.toBeInTheDocument()
  })

  it('keeps color-name language controls out of the header', () => {
    render(<TopBar />)
    expect(screen.queryByText('中文')).not.toBeInTheDocument()
    expect(screen.queryByText('English')).not.toBeInTheDocument()
  })

  it('does not render the card and grid tool switcher', () => {
    render(<TopBar />)
    expect(screen.queryByText('色卡卡片')).not.toBeInTheDocument()
    expect(screen.queryByText('图片切分')).not.toBeInTheDocument()
  })

  it('returns home when the brand is clicked', () => {
    const onHome = vi.fn()
    render(<TopBar onHome={onHome} />)
    fireEvent.click(screen.getByRole('button', { name: '映色格' }))
    expect(onHome).toHaveBeenCalledOnce()
  })

  it('renders tool tabs in the same header row as the title', () => {
    render(<TopBar tabs={<span>切分拼图</span>} />)

    const title = screen.getByRole('heading', { name: '映色格' })
    expect(title.parentElement?.parentElement).toContainElement(screen.getByText('切分拼图'))
  })
})
