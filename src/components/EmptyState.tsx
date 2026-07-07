import { UploadZone } from './UploadZone'
import { useTranslation } from '../i18n/LocaleContext'
import { Highlight } from './Highlight'

interface EmptyStateProps {
  onFileSelected: (file: File) => void
}

export function EmptyState({ onFileSelected }: EmptyStateProps) {
  const t = useTranslation()
  return (
    <div className="relative flex flex-col items-center overflow-hidden px-5 pt-10 pb-8">
      <div
        className="absolute -left-[10%] top-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(224,233,228,0.5)] mix-blend-multiply blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-[10%] bottom-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(223,233,227,0.5)] mix-blend-multiply blur-[80px]"
        aria-hidden="true"
      />
      <h2 className="type-display mx-0 mb-6 mt-0 text-center">
        <Highlight text={t.emptyState.heading} mark={t.emptyState.headingHighlight} />
      </h2>
      <UploadZone onFileSelected={onFileSelected} />
      <p className="type-body mt-5 text-center text-outline opacity-75">{t.emptyState.supportedFormats}</p>
    </div>
  )
}
