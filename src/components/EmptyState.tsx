import { UploadZone } from './UploadZone'

interface EmptyStateProps {
  onFileSelected: (file: File) => void
}

export function EmptyState({ onFileSelected }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden px-5 pt-24 pb-12">
      <div
        className="absolute -left-[10%] top-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(224,233,228,0.5)] mix-blend-multiply blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="absolute -right-[10%] bottom-[10%] -z-10 h-75 w-75 rounded-full bg-[rgba(223,233,227,0.5)] mix-blend-multiply blur-[80px]"
        aria-hidden="true"
      />
      <h2 className="mx-0 mb-12 mt-0 max-w-[12ch] text-center text-[32px] leading-[1.2] tracking-[-0.01em]">
        给照片，配一套颜色。
      </h2>
      <UploadZone onFileSelected={onFileSelected} />
      <p className="mt-8 text-center text-base text-outline opacity-75">本地解析支持 JPG / PNG / WEBP</p>
    </div>
  )
}
