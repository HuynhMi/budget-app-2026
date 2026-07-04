import type { Transaction, Category } from '../types'
import {
  type Period,
  parseISO,
  startOfWeek,
  startOfMonth,
  startOfYear,
  toISO,
  WEEKDAY_VI,
  MONTH_VI
} from './dates'

export interface SeriesPoint {
  label: string
  income: number
  expense: number
}

export interface CategorySlice {
  categoryId: string
  name: string
  color: string
  icon: string
  total: number
}

/**
 * Chuỗi số liệu cho biểu đồ line theo kỳ.
 * - week: 7 ngày (T2..CN) của tuần chứa `ref`
 * - month: các ngày trong tháng của `ref`
 * - year: 12 tháng của năm `ref`
 */
export function buildSeries(
  transactions: Transaction[],
  period: Period,
  ref: Date
): SeriesPoint[] {
  if (period === 'week') {
    const start = startOfWeek(ref)
    const points: SeriesPoint[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      points.push({ label: WEEKDAY_VI[d.getDay()], income: 0, expense: 0 })
    }
    for (const t of transactions) {
      const d = parseISO(t.date)
      const diff = Math.floor((dayStart(d) - dayStart(start)) / 86400000)
      if (diff >= 0 && diff < 7) add(points[diff], t)
    }
    return points
  }

  if (period === 'month') {
    const start = startOfMonth(ref)
    const daysInMonth = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate()
    const points: SeriesPoint[] = []
    for (let i = 1; i <= daysInMonth; i++) {
      points.push({ label: String(i), income: 0, expense: 0 })
    }
    for (const t of transactions) {
      const d = parseISO(t.date)
      if (d.getFullYear() === start.getFullYear() && d.getMonth() === start.getMonth()) {
        add(points[d.getDate() - 1], t)
      }
    }
    return points
  }

  // year
  const start = startOfYear(ref)
  const points: SeriesPoint[] = MONTH_VI.map((m) => ({ label: m, income: 0, expense: 0 }))
  for (const t of transactions) {
    const d = parseISO(t.date)
    if (d.getFullYear() === start.getFullYear()) add(points[d.getMonth()], t)
  }
  return points
}

export interface MonthPoint {
  label: string // 'T7'
  year: number
  month: number // 0..11
  expense: number
  income: number
  isCurrent: boolean
}

/** Chi/thu N tháng gần nhất (tính cả tháng chứa `ref`), cũ -> mới */
export function lastNMonths(transactions: Transaction[], ref: Date, n: number): MonthPoint[] {
  const points: MonthPoint[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(ref.getFullYear(), ref.getMonth() - i, 1)
    points.push({
      label: MONTH_VI[d.getMonth()],
      year: d.getFullYear(),
      month: d.getMonth(),
      expense: 0,
      income: 0,
      isCurrent: d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
    })
  }
  for (const t of transactions) {
    const d = parseISO(t.date)
    const p = points.find((x) => x.year === d.getFullYear() && x.month === d.getMonth())
    if (!p) continue
    if (t.type === 'income') p.income += t.amount
    else p.expense += t.amount
  }
  return points
}

/** Tổng thu & chi cho toàn bộ danh sách giao dịch đã lọc */
export function sumTotals(transactions: Transaction[]): { income: number; expense: number } {
  let income = 0
  let expense = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense }
}

/** Gộp chi tiêu theo danh mục (chỉ loại `type`), sắp xếp giảm dần */
export function byCategory(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense'
): CategorySlice[] {
  const map = new Map<string, number>()
  for (const t of transactions) {
    if (t.type !== type) continue
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount)
  }
  const slices: CategorySlice[] = []
  for (const [categoryId, total] of map) {
    const cat = categories.find((c) => c.id === categoryId)
    slices.push({
      categoryId,
      name: cat?.name ?? 'Khác',
      color: cat?.color ?? '#c084fc',
      icon: cat?.icon ?? '🏷️',
      total
    })
  }
  return slices.sort((a, b) => b.total - a.total)
}

function add(point: SeriesPoint, t: Transaction) {
  if (t.type === 'income') point.income += t.amount
  else point.expense += t.amount
}

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

// re-export tiện dùng
export { toISO }
