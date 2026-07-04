import { Palette, Grid2x2, ShieldCheck, Leaf, Zap } from 'lucide-react'

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
  return (
    <div className="px-5 pb-12">
      <section className="py-12">
        <h1 className="mb-6 max-w-[12ch] text-[32px] leading-[1.2] tracking-[-0.01em] text-on-surface">
          给照片，配一套颜色。
        </h1>
        <p className="max-w-md text-base leading-relaxed text-on-surface-variant opacity-80">
          极简的照片色卡与切分工具，让每一份视觉表达都拥有呼吸感。
        </p>
      </section>

      <section className="mb-16 flex flex-col gap-6">
        <ModeCard
          icon={<Palette size={22} strokeWidth={1.3} />}
          eyebrow="Creative Tool"
          title="色卡模式"
          description="提取主色调，生成精致色卡，记录每一个瞬间的光影情绪。"
          actionLabel="进入工作流"
          containerClassName="aspect-4/3 bg-primary-container/30 hover:bg-primary-container/50"
          inputTestId="home-card-upload-input"
          onFileSelected={onSelectCardPhoto}
        />
        <ModeCard
          icon={<Grid2x2 size={22} strokeWidth={1.3} />}
          eyebrow="Visual Layout"
          title="切分模式"
          description="九宫格切分，支持自定义间距，为社交平台打造平衡的视觉节奏。"
          actionLabel="开始排版"
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
          <h3 className="text-xl text-on-surface">本地解析</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            照片仅在设备本地进行解析，无需上传服务器。我们尊重并保护您的每一份视觉隐私。
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary"
            aria-hidden="true"
          >
            <Leaf size={22} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">极致清新</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            遵循"留白"设计哲学，去除一切不必要的干扰。专注于色彩本身，享受纯粹的创作过程。
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-primary"
            aria-hidden="true"
          >
            <Zap size={22} strokeWidth={1.5} />
          </span>
          <h3 className="text-xl text-on-surface">快速导出</h3>
          <p className="leading-relaxed text-on-surface-variant opacity-70">
            优化导出算法，一键保存至系统相册。无论是色卡还是九宫格，瞬间即可分享您的灵感。
          </p>
        </div>
      </section>
    </div>
  )
}
