import type { Transaction, Budget, BudgetPeriod } from '../types'
import { startOfWeek, startOfMonth, parseISO } from './dates'

/** Ngày bắt đầu kỳ hiện tại theo period, tính từ mốc `ref` */
export function periodStart(period: BudgetPeriod, ref: Date): Date {
  return period === 'week' ? startOfWeek(ref) : startOfMonth(ref)
}

/** Ngày kết thúc kỳ hiện tại (inclusive) */
export function periodEnd(period: BudgetPeriod, ref: Date): Date {
  if (period === 'week') {
    const s = startOfWeek(ref)
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6)
  }
  return new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
}

/** Tổng đã chi cho 1 danh mục trong kỳ hiện tại */
export function spentInPeriod(
  categoryId: string,
  period: BudgetPeriod,
  transactions: Transaction[],
  ref: Date
): number {
  const from = periodStart(period, ref).getTime()
  const to = periodEnd(period, ref).getTime()
  let sum = 0
  for (const t of transactions) {
    if (t.type !== 'expense' || t.categoryId !== categoryId) continue
    const d = parseISO(t.date).getTime()
    if (d >= from && d <= to) sum += t.amount
  }
  return sum
}

export interface BudgetStatus {
  budget: Budget
  spent: number
  remaining: number
  ratio: number // 0..>1
  level: 'ok' | 'warn' | 'over'
}

/** Tổng hạn mức quy về mỗi tháng (hạn mức tuần nhân ~4). 0 nếu chưa đặt gì. */
export function monthlyBudgetTotal(budgets: Budget[]): number {
  return budgets.reduce((sum, b) => sum + b.limit * (b.period === 'week' ? 4 : 1), 0)
}

/** Trạng thái 1 hạn mức: đã chi, còn lại, tỉ lệ, mức cảnh báo */
export function budgetStatus(budget: Budget, transactions: Transaction[], ref: Date): BudgetStatus {
  const spent = spentInPeriod(budget.categoryId, budget.period, transactions, ref)
  const ratio = budget.limit > 0 ? spent / budget.limit : 0
  const level: BudgetStatus['level'] = ratio > 1 ? 'over' : ratio >= 0.8 ? 'warn' : 'ok'
  return { budget, spent, remaining: budget.limit - spent, ratio, level }
}
