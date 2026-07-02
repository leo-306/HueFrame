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
    <div className="btn-group">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          className="btn"
          onClick={() => onSelect(option.id)}
          aria-pressed={selected === option.id}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
