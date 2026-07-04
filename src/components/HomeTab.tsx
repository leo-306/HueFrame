import { Palette, Grid2x2, ShieldCheck, Leaf, Zap } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'

interface HomeTabProps {
  onSelectCardPhoto: (file: File) => void
  onSelectGridPhoto: (file: File) => void
}

interface ModeCardProps {
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  containerClassName: string
  inputTestId: string
  onFileSelected: (file: File) => void
}

function ModeCard({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  containerClassName,
  inputTestId,
  onFileSelected,
}: ModeCardProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
  }

  return (
    <label
      className={`relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-4xl border border-outline-variant/30 p-8 transition-colors duration-400 ${containerClassName}`}
    >
      <span
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest/60 text-primary"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="mb-2 text-xs font-medium uppercase tracking-widest text-primary opacity-60">{eyebrow}</span>
      <h2 className="mb-3 text-[28px] leading-[1.3] text-on-surface">{title}</h2>
      <p className="max-w-xs text-on-surface-variant opacity-80">{description}</p>
      <span className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
        {actionLabel}
        <span aria-hidden="true">→</span>
      </span>
      <input
        data-testid={inputTestId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="sr-only"
      />
    </label>
  )
}

export function HomeTab({ onSelectCardPhoto, onSelectGridPhoto }: HomeTabProps) {
  const t = useTranslation()
  return (
    <div className="px-5 pb-12">
      <section className="py-12">
        <h1 className="mb-6 max-w-[12ch] text-[32px] leading-[1.2] tracking-[-0.01em] text-on-surface">
          {t.homeTab.heading}
        </h1>
        <p className="max-w-md text-base leading-relaxed text-on-surface-variant opacity-80">
          {t.homeTab.subheading}
        </p>
      </section>

      <section className="mb-16 flex flex-col gap-6">
        <ModeCard
          icon={<Palette size={22} strokeWidth={1.3} />}
          eyebrow={t.homeTab.cardEyebrow}
          title={t.homeTab.cardTitle}
          description={t.homeTab.cardDescription}
          actionLabel={t.homeTab.cardAction}
          containerClassName="aspect-4/3 bg-primary-container/30 hover:bg-primary-container/50"
          inputTestId="home-card-upload-input"
          onFileSelected={onSelectCardPhoto}
        />
        <ModeCard
          icon={<Grid2x2 size={22} strokeWidth={1.3} />}
          eyebrow={t.homeTab.gridEyebrow}
          title={t.homeTab.gridTitle}
          description={t.homeTab.gridDescription}
          actionLabel={t.homeTab.gridAction}
          containerClassName="aspect-4/3 bg-secondary-container/30 hover:bg-secondary-container/50"
          inputTestId="home-grid-upload-input"
          onFileSelected={onSelectGridPhoto}
        />
      </section>

      <section className="flex flex-col gap-10 border-t border-outline-variant/20 pt-12">
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary"
            aria-hidden="true"
          >
            <ShieldCheck size={22} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">{t.homeTab.localTitle}</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            {t.homeTab.localDescription}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary"
            aria-hidden="true"
          >
            <Leaf size={22} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">{t.homeTab.freshTitle}</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            {t.homeTab.freshDescription}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary"
            aria-hidden="true"
          >
            <Zap size={22} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">{t.homeTab.fastTitle}</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            {t.homeTab.fastDescription}
          </p>
        </div>
      </section>
    </div>
  )
}
