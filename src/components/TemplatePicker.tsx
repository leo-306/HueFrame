import { Button } from './ui/button'
import { useTranslation } from '../i18n/LocaleContext'

export type TemplateId = 'classicStrip' | 'magazineCover'

interface TemplatePickerProps {
  selected: TemplateId
  onSelect: (id: TemplateId) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  const t = useTranslation()
  const options: { id: TemplateId; label: string }[] = [
    { id: 'classicStrip', label: t.templatePicker.classicStrip },
    { id: 'magazineCover', label: t.templatePicker.magazineCover },
  ]
  return (
    <div className="my-3 flex flex-wrap gap-2">
      {options.map((option) => (
        <Button
          key={option.id}
          variant={selected === option.id ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onSelect(option.id)}
          aria-pressed={selected === option.id}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )
}
