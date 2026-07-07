export function Highlight({ text, mark }: { text: string; mark: string }) {
  const idx = text.indexOf(mark)
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-semibold text-[#00a86b]">{mark}</span>
      {text.slice(idx + mark.length)}
    </>
  )
}
