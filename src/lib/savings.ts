import type { Transaction, Budget, SavingsSweep } from '../types'
import { spentInPeriod } from './budget'

/** Khoá tháng 'YYYY-MM' của ngày ref */
export function monthKeyOf(ref: Date): string {
  return `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, '0')}`
}

/** Tổng phần dư (hạn mức − đã tiêu) của các hạn mức THÁNG trong tháng chứa ref; kẹp không âm */
export function monthlySurplus(budgets: Budget[], transactions: Transaction[], ref: Date): number {
  let sum = 0
  for (const b of budgets) {
    if (b.period !== 'month') continue
    const spent = spentInPeriod(b.categoryId, 'month', transactions, ref)
    sum += Math.max(0, b.limit - spent)
  }
  return sum
}

/**
 * Tháng liền trước có cần chốt hũ không.
 * Trả { month, amount } nếu: có hạn mức tháng, còn dư > 0, và chưa chốt tháng đó; ngược lại null.
 */
export function pendingSweep(
  now: Date,
  budgets: Budget[],
  transactions: Transaction[],
  sweeps: SavingsSweep[]
): { month: string; amount: number } | null {
  const prevRef = new Date(now.getFullYear(), now.getMonth(), 0) // ngày cuối tháng trước
  const month = monthKeyOf(prevRef)
  if (sweeps.some((s) => s.month === month)) return null
  if (!budgets.some((b) => b.period === 'month')) return null
  const amount = monthlySurplus(budgets, transactions, prevRef)
  if (amount <= 0) return null
  return { month, amount }
}
