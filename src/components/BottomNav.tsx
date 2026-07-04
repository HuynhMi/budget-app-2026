import type { Screen } from '../App'

const items: Array<{ key: Screen; label: string; icon: string }> = [
  { key: 'home', label: 'Trang chủ', icon: '🏠' },
  { key: 'history', label: 'Lịch sử', icon: '🕘' },
  { key: 'reports', label: 'Thống kê', icon: '📊' },
  { key: 'wallets', label: 'Ví', icon: '👛' }
]

interface Props {
  current: Screen
  onNavigate: (s: Screen) => void
  onAdd: () => void
}

export function BottomNav({ current, onNavigate, onAdd }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 pointer-events-none">
      <div className="relative mx-4 mb-4 pointer-events-auto">
        <div className="flex items-center justify-between bg-white/95 backdrop-blur rounded-3xl shadow-soft px-3 py-2">
          <NavBtn item={items[0]} current={current} onNavigate={onNavigate} />
          <NavBtn item={items[1]} current={current} onNavigate={onNavigate} />
          <div className="w-14" />
          <NavBtn item={items[2]} current={current} onNavigate={onNavigate} />
          <NavBtn item={items[3]} current={current} onNavigate={onNavigate} />
        </div>
        <button
          onClick={onAdd}
          aria-label="Thêm giao dịch"
          className="absolute left-1/2 -translate-x-1/2 -top-5 h-16 w-16 rounded-full bg-gradient-to-br from-brand-500 to-pinkish-500 text-white text-3xl shadow-soft flex items-center justify-center active:scale-95 transition-transform"
        >
          +
        </button>
      </div>
    </nav>
  )
}

function NavBtn({
  item,
  current,
  onNavigate
}: {
  item: { key: Screen; label: string; icon: string }
  current: Screen
  onNavigate: (s: Screen) => void
}) {
  const active = current === item.key
  return (
    <button
      onClick={() => onNavigate(item.key)}
      className="flex-1 flex flex-col items-center gap-0.5 py-1"
      aria-label={item.label}
    >
      <span className={`text-xl transition-transform ${active ? 'scale-110' : 'opacity-50 grayscale'}`}>
        {item.icon}
      </span>
      <span className={`text-[10px] font-medium ${active ? 'text-brand-600' : 'text-muted'}`}>{item.label}</span>
    </button>
  )
}
