import { describe, it, expect } from 'vitest'
import { spentInPeriod, budgetStatus } from './budget'
import type { Transaction, Budget } from '../types'

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
