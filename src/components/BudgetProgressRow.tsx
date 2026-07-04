import { formatVND } from '../lib/money'
import type { BudgetStatus } from '../lib/budget'
import type { Category } from '../types'

export const LEVEL_COLOR: Record<BudgetStatus['level'], string> = {
  ok: '#22c55e',
  warn: '#f59e0b',
  over: '#ef4444'
}

/** Một dòng tiến độ ngân sách: đã chi / hạn mức + thanh + còn lại/vượt */
export function BudgetProgressRow({ status, category }: { status: BudgetStatus; category?: Category }) {
  const color = LEVEL_COLOR[status.level]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-xl"
            style={{ backgroundColor: (category?.color ?? '#c084fc') + '22' }}
          >
            {category?.icon ?? '🏷️'}
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">{category?.name ?? 'Danh mục'}</div>
            <div className="text-xs text-muted">{status.budget.period === 'month' ? 'Mỗi tháng' : 'Mỗi tuần'}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold" style={{ color }}>{formatVND(status.spent)}</div>
          <div className="text-xs text-muted">/ {formatVND(status.budget.limit)}</div>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-brand-50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, status.ratio * 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs mt-1.5 font-medium" style={{ color }}>
        {status.level === 'over'
          ? `⚠️ Vượt hạn mức ${formatVND(-status.remaining)}`
          : status.level === 'warn'
            ? `Sắp hết! Còn ${formatVND(status.remaining)}`
            : `Còn lại ${formatVND(status.remaining)}`}
      </div>
    </div>
  )
}
