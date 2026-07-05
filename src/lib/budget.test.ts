import { describe, it, expect } from 'vitest'
import { spentInPeriod, budgetStatus, weeklyPacing } from './budget'
import type { Transaction, Budget } from '../types'

const foodMonth = (limit: number): Budget => ({ id: 'b', categoryId: 'food', period: 'month', limit })
const exp = (date: string, amount: number, categoryId = 'food'): Transaction => ({
  id: date + amount, type: 'expense', name: 'x', amount, date, walletId: 'a', categoryId, createdAt: 0
})

const ref = new Date(2026, 6, 15) // 15/07/2026 (thứ 4)

const txns: Transaction[] = [
  { id: '1', type: 'expense', name: 'Phở', amount: 500000, date: '2026-07-01', walletId: 'a', categoryId: 'food', createdAt: 0 },
  { id: '2', type: 'expense', name: 'Cơm', amount: 300000, date: '2026-07-15', walletId: 'a', categoryId: 'food', createdAt: 0 },
  { id: '3', type: 'expense', name: 'Áo', amount: 900000, date: '2026-07-10', walletId: 'a', categoryId: 'shop', createdAt: 0 },
  { id: '4', type: 'expense', name: 'Cũ', amount: 999000, date: '2026-06-20', walletId: 'a', categoryId: 'food', createdAt: 0 },
  { id: '5', type: 'income', name: 'Lương', amount: 100000, date: '2026-07-05', walletId: 'a', categoryId: 'food', createdAt: 0 }
]

describe('spentInPeriod', () => {
  it('tháng: chỉ cộng chi của danh mục trong tháng hiện tại', () => {
    // food tháng 7: 500000 + 300000 = 800000 (bỏ tháng 6, bỏ income)
    expect(spentInPeriod('food', 'month', txns, ref)).toBe(800000)
  })
  it('tuần: chỉ cộng chi trong tuần chứa ref', () => {
    // Tuần chứa 15/07 (T2 13/07 -> CN 19/07): chỉ có giao dịch ngày 15 = 300000
    expect(spentInPeriod('food', 'week', txns, ref)).toBe(300000)
  })
})

describe('budgetStatus', () => {
  it('over khi vượt hạn mức', () => {
    const b: Budget = { id: 'b1', categoryId: 'food', period: 'month', limit: 700000 }
    const s = budgetStatus(b, txns, ref)
    expect(s.spent).toBe(800000)
    expect(s.remaining).toBe(-100000)
    expect(s.level).toBe('over')
  })
  it('warn khi >= 80%', () => {
    const b: Budget = { id: 'b2', categoryId: 'shop', period: 'month', limit: 1000000 }
    expect(budgetStatus(b, txns, ref).level).toBe('warn') // 900k/1tr = 90%
  })
  it('ok khi thấp', () => {
    const b: Budget = { id: 'b3', categoryId: 'shop', period: 'month', limit: 5000000 }
    expect(budgetStatus(b, txns, ref).level).toBe('ok')
  })
})

describe('weeklyPacing', () => {
  it('đầu tháng chưa tiêu: chia đều theo số tuần, bỏ qua chi tháng trước', () => {
    // Tháng 7/2026 phủ 5 tuần (T2: 29/6, 6, 13, 20, 27). Chi 30/6 phải bị bỏ qua.
    const p = weeklyPacing(foodMonth(2000000), [exp('2026-06-30', 999000)], new Date(2026, 6, 1))
    expect(p.weeksLeft).toBe(5)
    expect(p.allowanceThisWeek).toBe(400000) // 2.000.000 / 5
    expect(p.spentThisWeek).toBe(0)
    expect(p.remainingThisWeek).toBe(400000)
  })

  it('dồn dư: tiêu ít tuần trước → tuần này được nhiều hơn', () => {
    // Tuần 1 (29/6–5/7) chỉ tiêu 300k; sang tuần 2 (6–12/7) còn 4 tuần
    const p = weeklyPacing(foodMonth(2000000), [exp('2026-07-03', 300000)], new Date(2026, 6, 8))
    expect(p.weeksLeft).toBe(4)
    expect(p.allowanceThisWeek).toBe(425000) // (2.000.000 − 300.000) / 4
    expect(p.remainingThisWeek).toBe(425000)
  })

  it('tiêu lố trong tuần → còn lại tuần này âm', () => {
    const txs = [exp('2026-07-01', 500000), exp('2026-07-14', 700000)]
    const p = weeklyPacing(foodMonth(1000000), txs, new Date(2026, 6, 15))
    expect(p.spentThisWeek).toBe(700000)
    expect(p.remainingThisWeek).toBeLessThan(0)
  })

  it('tuần cuối tháng: chỉ còn 1 tuần, được tiêu toàn bộ phần còn lại', () => {
    // Đã tiêu 1.5tr trước tuần cuối; hạn mức 2tr → tuần cuối được 500k
    const before = Array.from({ length: 3 }, (_, i) => exp(`2026-07-0${i + 2}`, 500000))
    const p = weeklyPacing(foodMonth(2000000), [...before, exp('2026-07-29', 200000)], new Date(2026, 6, 28))
    expect(p.weeksLeft).toBe(1)
    expect(p.allowanceThisWeek).toBe(500000)
    expect(p.remainingThisWeek).toBe(300000) // 500.000 − 200.000
  })
})
