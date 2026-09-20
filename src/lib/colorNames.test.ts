import { describe, it, expect } from 'vitest'
import { disambiguateColorNames, nearestColorName } from './colorNames'

describe('nearestColorName', () => {
  it('matches a pure red to a red-family Chinese name', () => {
    const result = nearestColorName([230, 30, 30])
    expect(result.zh).toBeTruthy()
    expect(result.en).toBeTruthy()
  })

  it('matches a pure blue to a blue-family Chinese name', () => {
    const result = nearestColorName([20, 40, 200])
    expect(result.zh).toBeTruthy()
  })

  it('returns the same name for identical colors', () => {
    const a = nearestColorName([100, 150, 200])
    const b = nearestColorName([100, 150, 200])
    expect(a.zh).toBe(b.zh)
  })
})

describe('disambiguateColorNames', () => {
  const entry = (name: { zh: string; en: string }, rgb: [number, number, number]) => ({
    name: { ...name, rgb },
    rgb,
  })

  it('prefixes colliding names with lightness qualifiers', () => {
    const result = disambiguateColorNames([
      entry({ zh: '姜黄', en: 'Turmeric' }, [196, 212, 108]),
      entry({ zh: '竹青', en: 'Bamboo Green' }, [44, 124, 92]),
      entry({ zh: '姜黄', en: 'Turmeric' }, [244, 196, 76]),
    ])
    const zhNames = result.map((r) => r.name.zh)
    expect(new Set(zhNames).size).toBe(3)
    expect(zhNames.filter((n) => n.includes('姜黄'))).toEqual(['偏青姜黄', '偏红姜黄'])
    expect(zhNames.find((n) => n.includes('竹青'))).toBe('竹青')
  })

  it('leaves unique names untouched', () => {
    const input = [entry({ zh: '玄黑', en: 'Deep Black' }, [20, 20, 25])]
    expect(disambiguateColorNames(input)[0].name.zh).toBe('玄黑')
    expect(disambiguateColorNames(input)[0].name.en).toBe('Deep Black')
  })

  it('uses Deep/Light when the colliding pair differs mainly in lightness', () => {
    const result = disambiguateColorNames([
      entry({ zh: '墨灰', en: 'Ink Grey' }, [40, 40, 45]),
      entry({ zh: '墨灰', en: 'Ink Grey' }, [200, 200, 205]),
    ])
    expect(result[0].name.en).toBe('Deep Ink Grey')
    expect(result[1].name.en).toBe('Light Ink Grey')
  })

  it('guarantees unique names even when three swatches collide', () => {
    const result = disambiguateColorNames([
      entry({ zh: '姜黄', en: 'Turmeric' }, [196, 212, 108]),
      entry({ zh: '姜黄', en: 'Turmeric' }, [244, 196, 76]),
      entry({ zh: '姜黄', en: 'Turmeric' }, [220, 190, 60]),
    ])
    expect(new Set(result.map((r) => r.name.zh)).size).toBe(3)
    expect(new Set(result.map((r) => r.name.en)).size).toBe(3)
  })

  it('does not mutate the entries it was given', () => {
    const input = [
      entry({ zh: '姜黄', en: 'Turmeric' }, [196, 212, 108]),
      entry({ zh: '姜黄', en: 'Turmeric' }, [244, 196, 76]),
    ]
    disambiguateColorNames(input)
    expect(input[0].name.zh).toBe('姜黄')
  })
})
