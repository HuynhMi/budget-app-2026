export type Period = 'week' | 'month' | 'year'

export function todayISO(): string {
  return toISO(new Date())
}

export function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Thứ 2 đầu tuần chứa ngày d (tuần bắt đầu từ Thứ 2) */
export function startOfWeek(d: Date): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = (date.getDay() + 6) % 7 // 0 = Thứ 2
  date.setDate(date.getDate() - day)
  return date
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1)
}

/** Kiểm tra ngày ISO có nằm trong khoảng [from, to] (inclusive) không */
export function inRange(dateISO: string, from: Date, to: Date): boolean {
  const t = parseISO(dateISO).getTime()
  return t >= from.getTime() && t <= to.getTime()
}

export const WEEKDAY_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
export const MONTH_VI = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
