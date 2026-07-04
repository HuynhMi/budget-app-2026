import type { Category, Wallet } from '../types'
import { formatVND } from '../lib/money'

interface Props {
  icon: string
  color: string
  title: string
  subtitle: string
  amount: number
  kind: 'income' | 'expense' | 'transfer'
  onClick?: () => void
}

export function TxnRow({ icon, color, title, subtitle, amount, kind, onClick }: Props) {
  const sign = kind === 'income' ? '+' : kind === 'expense' ? '-' : ''
  const amountColor =
    kind === 'income' ? 'text-green-600' : kind === 'expense' ? 'text-pinkish-500' : 'text-brand-600'
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-3 text-left active:opacity-70 transition-opacity"
    >
      <div
        className="h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center text-xl"
        style={{ backgroundColor: color + '22' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate">{title}</div>
        <div className="text-xs text-muted truncate">{subtitle}</div>
      </div>
      <div className={`font-bold ${amountColor} whitespace-nowrap`}>
        {sign}
        {formatVND(amount).replace(' ₫', '')}
        <span className="text-xs font-normal"> ₫</span>
      </div>
    </button>
  )
}

export function walletById(wallets: Wallet[], id: string): Wallet | undefined {
  return wallets.find((w) => w.id === id)
}
export function categoryById(categories: Category[], id: string): Category | undefined {
  return categories.find((c) => c.id === id)
}
