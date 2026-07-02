import type { ColorNameLanguage, PaletteEntry } from '../templates/types'

interface PaletteListProps {
  palette: PaletteEntry[]
  language: ColorNameLanguage
  onColorChange: (index: number, newHex: string) => void
}

export function PaletteList({ palette, language, onColorChange }: PaletteListProps) {
  return (
    <ul>
      {palette.map((entry, index) => (
        <li key={index}>
          <input
            type="color"
            aria-label={`edit-color-${index}`}
            value={entry.hex}
            onChange={(e) => onColorChange(index, e.target.value)}
          />
          <span>{language === 'en' ? entry.name.en : entry.name.zh}</span>
          <span>{entry.hex.toUpperCase()}</span>
          {entry.percentage !== undefined && <span>{entry.percentage}%</span>}
        </li>
      ))}
    </ul>
  )
}
