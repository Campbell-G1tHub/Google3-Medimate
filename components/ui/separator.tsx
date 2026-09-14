export function Separator({ label = "" }: { label?: string }) {
  return (
    <div className="divider font-semibold text-sm">{label}</div>
  )
}