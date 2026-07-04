import { Leaf } from 'lucide-react'

interface LoadingOverlayProps {
  label: string
  mode?: 'viewport' | 'container'
}

export function LoadingOverlay({ label, mode = 'viewport' }: LoadingOverlayProps) {
  const positioning = mode === 'viewport' ? 'fixed' : 'absolute'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`${positioning} inset-0 z-[70] flex items-center justify-center bg-surface/72 px-6 backdrop-blur-[6px]`}
    >
      <div className="flex min-w-44 flex-col items-center rounded-[2rem] border border-white/80 bg-white/65 px-9 py-8 shadow-[0_24px_80px_rgba(87,96,93,0.12)] backdrop-blur-xl">
        <div className="relative mb-5 flex size-18 items-center justify-center" aria-hidden="true">
          <span className="hueframe-loading-halo absolute inset-1 rounded-full bg-primary-container/75" />
          <span className="hueframe-loading-orbit absolute inset-0 rounded-full border border-primary/15">
            <span className="absolute left-1/2 top-[-3px] size-2 -translate-x-1/2 rounded-full bg-primary/55 shadow-[0_0_12px_rgba(87,96,93,0.28)]" />
          </span>
          <span className="relative flex size-11 items-center justify-center rounded-full border border-white/85 bg-white/75 text-primary shadow-sm">
            <Leaf size={20} strokeWidth={1.45} />
          </span>
        </div>
        <p className="type-label m-0 font-medium tracking-[0.08em] text-on-surface-variant">{label}</p>
      </div>
    </div>
  )
}
