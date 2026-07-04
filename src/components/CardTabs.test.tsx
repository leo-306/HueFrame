import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardTabs } from './CardTabs'

describe('CardTabs', () => {
  it('renders all four sub-tab labels', () => {
    render(
      <CardTabs
        active="filter"
        onSelect={vi.fn()}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    expect(screen.getByText('滤镜')).toBeInTheDocument()
    expect(screen.getByText('版式')).toBeInTheDocument()
    expect(screen.getByText('调色')).toBeInTheDocument()
    expect(screen.getByText('信息')).toBeInTheDocument()
  })

  it('only renders the panel for the active tab', () => {
    render(
      <CardTabs
        active="palette"
        onSelect={vi.fn()}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    expect(screen.getByText('调色面板')).toBeInTheDocument()
    expect(screen.queryByText('滤镜面板')).not.toBeInTheDocument()
  })

  it('calls onSelect with the clicked sub-tab id', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(
      <CardTabs
        active="filter"
        onSelect={onSelect}
        filterPanel={<div>滤镜面板</div>}
        layoutPanel={<div>版式面板</div>}
        palettePanel={<div>调色面板</div>}
        infoPanel={<div>信息面板</div>}
      />
    )
    await user.click(screen.getByText('调色'))
    expect(onSelect).toHaveBeenCalledWith('palette')
  })
})
