export function Highlight({ text, mark }: { text: string; mark: string }) {
  const idx = text.indexOf(mark)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="rounded bg-primary-container px-1 text-primary">{mark}</span>
      {text.slice(idx + mark.length)}
    </>
  )
}
