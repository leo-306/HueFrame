import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/button'
import { useTranslation } from '../i18n/LocaleContext'
import type { TemplateId } from '../templates/types'

export type { TemplateId } from '../templates/types'

interface TemplatePickerProps {
  selected: TemplateId
  onSelect: (id: TemplateId) => void
  onClose: () => void
}

export function TemplatePicker({ selected, onSelect, onClose }: TemplatePickerProps) {
  const t = useTranslation()
  const options: { id: TemplateId; label: string }[] = [
    { id: 'classicStrip', label: t.templatePicker.classicStrip },
    { id: 'magazineCover', label: t.templatePicker.magazineCover },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-on-surface/25 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-2xl sm:p-8">
        <h2 id="template-picker-title" className="type-heading mb-6 text-center text-on-surface">
          {t.layoutControls.template}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={t.templatePicker.closeTemplatePicker}
          className="absolute top-4 right-4 rounded-full"
        >
          <X />
        </Button>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => (
            <Button
              key={option.id}
              variant={selected === option.id ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => onSelect(option.id)}
              aria-pressed={selected === option.id}
              className="h-14 bg-surface"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
