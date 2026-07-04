export const WALLET_ICONS = ['💵', '🏦', '💳', '🐷', '📱', '💰', '🪙', '🎯', '✈️', '🏠']
export const CATEGORY_ICONS = [
  '🍜', '🛍️', '🚕', '🧾', '🎬', '💊', '🏠', '📚', '☕', '⛽',
  '🎁', '💼', '📈', '💰', '🏷️', '🐶', '👕', '💇', '🍺', '🎮'
]
export const COLORS = [
  '#a855f7', '#ec4899', '#f472b6', '#818cf8', '#22d3ee',
  '#fb923c', '#34d399', '#f59e0b', '#22c55e', '#ef4444'
]

export function IconPicker({
  icons,
  value,
  onChange
}: {
  icons: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {icons.map((ic) => (
        <button
          key={ic}
          type="button"
          onClick={() => onChange(ic)}
          className={`h-11 w-11 rounded-2xl text-xl flex items-center justify-center transition-all ${
            value === ic ? 'bg-brand-500 scale-105 shadow-soft' : 'bg-white'
          }`}
        >
          {ic}
        </button>
      ))}
    </div>
  )
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          className={`h-9 w-9 rounded-full transition-transform ${value === c ? 'ring-2 ring-offset-2 ring-ink scale-110' : ''}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
