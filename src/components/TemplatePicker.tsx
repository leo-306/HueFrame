import { Button } from './ui/button'

export type TemplateId = 'classicStrip' | 'magazineCover'

interface Option {
  id: TemplateId
  label: string
}

const OPTIONS: Option[] = [
  { id: 'classicStrip', label: '经典色带' },
  { id: 'magazineCover', label: '杂志封面' },
]

interface TemplatePickerProps {
  selected: TemplateId
  onSelect: (id: TemplateId) => void
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="my-3 flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
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
