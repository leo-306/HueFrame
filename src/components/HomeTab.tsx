import { SwatchBook, Grid3X3, LockKeyhole, Feather, Download } from 'lucide-react'
import { useTranslation } from '../i18n/LocaleContext'
import { Highlight } from './Highlight'

interface HomeTabProps {
  onSelectCard: () => void
  onSelectGrid: () => void
}

interface ModeCardProps {
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  containerClassName: string
  backgroundImage: string
  onSelect: () => void
}

function ModeCard({
  icon,
  eyebrow,
  title,
  description,
  actionLabel,
  containerClassName,
  backgroundImage,
  onSelect,
}: ModeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{ backgroundImage: `url('${backgroundImage}')` }}
      className={`group relative flex cursor-pointer flex-col justify-end overflow-hidden rounded-4xl border border-outline-variant/30 bg-cover bg-center p-8 text-left transition-all duration-400 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(67,72,70,0.09)] ${containerClassName}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(249,249,248,0.96)_0%,rgba(249,249,248,0.9)_48%,rgba(249,249,248,0.32)_100%)]"
      />
      <span
        className="relative z-10 mb-4 flex size-11 shrink-0 self-start items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-primary-container text-primary backdrop-blur-sm transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary-container/80"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="type-caption relative z-10 mb-2 font-medium uppercase tracking-widest text-primary opacity-60">{eyebrow}</span>
      <h2 className="type-heading relative z-10 mb-3 text-on-surface">{title}</h2>
      <p className="type-body relative z-10 max-w-xs text-on-surface-variant opacity-80">{description}</p>
      <span className="type-label relative z-10 mt-6 flex items-center gap-2 font-medium text-primary">
        {actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </button>
  )
}

export function HomeTab({ onSelectCard, onSelectGrid }: HomeTabProps) {
  const t = useTranslation()
  return (
    <div className="px-5 pb-12">
      <section className="py-12">
        <h1 className="type-display mb-6 text-on-surface">
          <Highlight text={t.homeTab.heading} mark={t.homeTab.headingHighlight} />
        </h1>
        <p className="type-body max-w-md text-on-surface-variant opacity-80">
          <Highlight text={t.homeTab.subheading} mark={t.homeTab.subheadingHighlight} />
        </p>
      </section>

      <section className="mb-16 flex flex-col gap-6">
        <ModeCard
          icon={<SwatchBook size={23} strokeWidth={1.45} />}
          eyebrow={t.homeTab.cardEyebrow}
          title={t.homeTab.cardTitle}
          description={t.homeTab.cardDescription}
          actionLabel={t.homeTab.cardAction}
          containerClassName="min-h-[320px] bg-primary-container/30 hover:bg-primary-container/50"
          backgroundImage="/images/home-palette-bg.jpg"
          onSelect={onSelectCard}
        />
        <ModeCard
          icon={<Grid3X3 size={23} strokeWidth={1.45} />}
          eyebrow={t.homeTab.gridEyebrow}
          title={t.homeTab.gridTitle}
          description={t.homeTab.gridDescription}
          actionLabel={t.homeTab.gridAction}
          containerClassName="min-h-[320px] bg-secondary-container/30 hover:bg-secondary-container/50"
          backgroundImage="/images/home-grid-bg.jpg"
          onSelect={onSelectGrid}
        />
      </section>

      <section className="flex flex-col gap-10 border-t border-outline-variant/20 pt-12">
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-container bg-primary-container/70 text-primary shadow-[0_8px_24px_rgba(67,72,70,0.06)]"
            aria-hidden="true"
          >
            <LockKeyhole size={21} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">{t.homeTab.localTitle}</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            {t.homeTab.localDescription}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-container bg-primary-container/70 text-primary shadow-[0_8px_24px_rgba(67,72,70,0.06)]"
            aria-hidden="true"
          >
            <Feather size={21} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">{t.homeTab.freshTitle}</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            {t.homeTab.freshDescription}
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary-container bg-primary-container/70 text-primary shadow-[0_8px_24px_rgba(67,72,70,0.06)]"
            aria-hidden="true"
          >
            <Download size={21} strokeWidth={1.5} />
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
