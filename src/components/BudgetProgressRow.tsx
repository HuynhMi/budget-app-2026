import { formatVND, formatShort } from '../lib/money'
import type { BudgetStatus, WeeklyPacing } from '../lib/budget'
import type { Category } from '../types'

export const LEVEL_COLOR: Record<BudgetStatus['level'], string> = {
  ok: '#22c55e',
  warn: '#f59e0b',
  over: '#ef4444'
}

/** Màu số tiền ĐÃ CHI — luôn là màu "chi" (hồng), không đổi theo mức để khỏi nhầm với tiền thu */
const SPENT_COLOR = '#ec4899'
const WEEK_OK = '#16a34a'
const WEEK_OVER = '#ec4899'

function statusText(s: BudgetStatus, short: boolean): string {
  const fmt = short ? formatShort : (n: number) => formatVND(n)
  if (s.level === 'over') return `${short ? 'Vượt' : '⚠️ Vượt hạn mức'} ${fmt(-s.remaining)}`
  if (s.level === 'warn') return `${short ? 'Còn' : 'Sắp hết! Còn'} ${fmt(s.remaining)}`
  return `Còn ${fmt(s.remaining)}`
}

function weekText(p: WeeklyPacing, short: boolean): string {
  const fmt = short ? formatShort : (n: number) => formatVND(n)
  return p.remainingThisWeek >= 0
    ? `Tuần này còn ${fmt(p.remainingThisWeek)}`
    : `Vượt tuần ${fmt(-p.remainingThisWeek)}`
}

/** Một dòng tiến độ ngân sách. compact=true: gọn (cho Trang chủ). pacing: nhịp tuần của hạn mức tháng. */
export function BudgetProgressRow({
  status,
  category,
  pacing,
  compact = false
}: {
  status: BudgetStatus
  category?: Category
  pacing?: WeeklyPacing
  compact?: boolean
}) {
  const color = LEVEL_COLOR[status.level]
  const icon = category?.icon ?? '🏷️'
  const name = category?.name ?? 'Danh mục'
  const catColor = category?.color ?? '#c084fc'
  const weekly = status.budget.period === 'week'
  const weekColor = pacing && pacing.remainingThisWeek < 0 ? WEEK_OVER : WEEK_OK

  if (compact) {
    return (
      <div>
        <div className="flex items-center gap-2.5">
          <span
            className="h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-base"
            style={{ backgroundColor: catColor + '22' }}
          >
            {icon}
          </span>
          <span className="flex-1 min-w-0 font-semibold truncate">
            {name}
            {weekly && <span className="text-[10px] text-muted font-normal"> · tuần</span>}
          </span>
          <span className="text-sm shrink-0">
            <b style={{ color: SPENT_COLOR }}>{formatShort(status.spent)}</b>
            <span className="text-muted"> / {formatShort(status.budget.limit)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 rounded-full bg-brand-50 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, status.ratio * 100)}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-[10px] font-medium shrink-0" style={{ color }}>
            {statusText(status, true)}
          </span>
        </div>
        {pacing && (
          <div className="text-[10px] font-medium mt-1" style={{ color: weekColor }}>
            🗓️ {weekText(pacing, true)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center text-xl"
            style={{ backgroundColor: catColor + '22' }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">{name}</div>
            <div className="text-xs text-muted">{weekly ? 'Mỗi tuần' : 'Mỗi tháng'}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold" style={{ color: SPENT_COLOR }}>{formatVND(status.spent)}</div>
          <div className="text-xs text-muted">/ {formatVND(status.budget.limit)}</div>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-brand-50 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, status.ratio * 100)}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex items-center justify-between mt-1.5 gap-3">
        <div className="text-xs font-medium" style={{ color }}>
          {statusText(status, false)}
        </div>
        {pacing && (
          <div className="text-xs font-semibold shrink-0" style={{ color: weekColor }}>
            🗓️ {weekText(pacing, false)}
          </div>
        )}
      </div>
    </div>
  )
}
