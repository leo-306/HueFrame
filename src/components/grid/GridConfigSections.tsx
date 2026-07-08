import type { ReactNode } from 'react'

interface GridConfigSection {
  id: string
  label: string
  content: ReactNode
}

interface GridConfigSectionsProps {
  sections: GridConfigSection[]
}

export function GridConfigSections({ sections }: GridConfigSectionsProps) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
      {sections.map((section) => (
        <section key={section.id} className="border-t border-outline-variant/30 p-5 first:border-t-0 sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <h3 className="type-body shrink-0 font-semibold tracking-[0.03em] text-on-surface">
              {section.label}
            </h3>
            <span className="h-px flex-1 bg-outline-variant/35" aria-hidden="true" />
          </div>
          {section.content}
        </section>
      ))}
    </div>
  )
}
