import { useState } from 'react'
import type { ColorNameLanguage, PaletteEntry } from '../templates/types'
import type { ColorFormat } from '../lib/colorFormat'
import { formatColorValue } from '../lib/colorFormat'
import { useTranslation } from '../i18n/LocaleContext'
import { ArrowDown, ArrowUp, Check, Copy } from 'lucide-react'
import { Button } from './ui/button'

interface PaletteListProps {
  palette: PaletteEntry[]
  language: ColorNameLanguage
  colorFormat: ColorFormat
  onColorChange: (index: number, newHex: string) => void
  onMove: (index: number, direction: 'up' | 'down') => void
}

export function PaletteList({
  palette,
  language,
  colorFormat,
  onColorChange,
  onMove,
}: PaletteListProps) {
  const t = useTranslation()
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (index: number, entry: PaletteEntry) => {
    const text = formatColorValue(entry.rgb, colorFormat)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      window.setTimeout(() => setCopiedIndex((current) => (current === index ? null : current)), 1200)
    } catch {
      // 剪贴板不可用（如非安全上下文）时静默失败，不打断编辑流程
    }
  }

  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {palette.map((entry, index) => {
        const name = language === 'en' ? entry.name.en : entry.name.zh
        const value = formatColorValue(entry.rgb, colorFormat)
        const copied = copiedIndex === index
        return (
          <li
            key={index}
            className="flex items-center gap-3 rounded-md border border-outline-variant bg-surface-container-low px-3 py-2.5"
          >
            <input
              type="color"
              aria-label={`${t.cardTabs.editColor} ${name}`}
              value={entry.hex}
              onChange={(e) => onColorChange(index, e.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer rounded-sm border border-outline-variant p-0"
            />
            <span className="type-label flex-1">{name}</span>
            <button
              type="button"
              onClick={() => handleCopy(index, entry)}
              aria-label={`${copied ? t.cardTabs.copiedColor : t.cardTabs.copyColor} ${value}`}
              className="type-caption flex items-center gap-1 rounded font-mono text-on-surface-variant transition-colors hover:text-primary active:text-primary"
            >
              {value}
              {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5 opacity-60" />}
            </button>
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
                aria-label={`${t.cardTabs.moveUp} ${name}`}
                onClick={() => onMove(index, 'up')}
              >
                <ArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={index === palette.length - 1}
                aria-label={`${t.cardTabs.moveDown} ${name}`}
                onClick={() => onMove(index, 'down')}
              >
                <ArrowDown />
              </Button>
            </div>
          </li>
        )
      })}
      {/* 屏幕阅读器播报复制结果 */}
      <span aria-live="polite" className="sr-only">
        {copiedIndex !== null ? t.cardTabs.copiedColor : ''}
      </span>
    </ul>
  )
}
