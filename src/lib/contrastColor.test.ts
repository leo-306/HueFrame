import { describe, it, expect } from 'vitest'
import { pickReadableTextColor } from './contrastColor'

describe('pickReadableTextColor', () => {
  it('picks white text on a dark background', () => {
    expect(pickReadableTextColor([20, 20, 30])).toBe('#ffffff')
  })

  it('picks black text on a light background', () => {
    expect(pickReadableTextColor([245, 240, 230])).toBe('#000000')
  })
})
