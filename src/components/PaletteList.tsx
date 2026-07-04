import type { ColorNameLanguage, PaletteEntry } from '../templates/types'

interface PaletteListProps {
  palette: PaletteEntry[]
  language: ColorNameLanguage
  onColorChange: (index: number, newHex: string) => void
}

export function PaletteList({ palette, language, onColorChange }: PaletteListProps) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {palette.map((entry, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2.5"
        >
          <input
            type="color"
            aria-label={`edit-color-${index}`}
            value={entry.hex}
            onChange={(e) => onColorChange(index, e.target.value)}
            className="h-8 w-8 shrink-0 cursor-pointer rounded-sm border border-outline-variant p-0"
          />
          <span className="flex-1 text-sm">{language === 'en' ? entry.name.en : entry.name.zh}</span>
          <span className="font-mono text-xs text-on-surface-variant">{entry.hex.toUpperCase()}</span>
          {entry.percentage !== undefined && (
            <span className="min-w-8 text-right text-xs text-on-surface-variant">{entry.percentage}%</span>
          )}
        </li>
      ))}
    </ul>
  )
}
