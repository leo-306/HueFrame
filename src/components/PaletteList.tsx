import type { ColorNameLanguage, PaletteEntry } from '../templates/types'
import { useTranslation } from '../i18n/LocaleContext'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from './ui/button'

interface PaletteListProps {
  palette: PaletteEntry[]
  language: ColorNameLanguage
  onColorChange: (index: number, newHex: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

export function PaletteList({ palette, language, onColorChange, onMove }: PaletteListProps) {
  const t = useTranslation()
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
          <span className="type-label flex-1">{language === 'en' ? entry.name.en : entry.name.zh}</span>
          <span className="type-caption font-mono text-on-surface-variant">{entry.hex.toUpperCase()}</span>
          {entry.percentage !== undefined && (
            <span className="type-caption min-w-16 text-right text-on-surface-variant">
              {t.cardTabs.colorPercentage} {entry.percentage}%
            </span>
          )}
          <div className="flex shrink-0 gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={index === 0}
              aria-label={`${t.cardTabs.moveUp} ${language === 'en' ? entry.name.en : entry.name.zh}`}
              onClick={() => onMove(index, 'up')}
            >
              <ArrowUp />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={index === palette.length - 1}
              aria-label={`${t.cardTabs.moveDown} ${language === 'en' ? entry.name.en : entry.name.zh}`}
              onClick={() => onMove(index, 'down')}
            >
              <ArrowDown />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
