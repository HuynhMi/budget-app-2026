import { describe, it, expect } from 'vitest'
import { monthKeyOf, monthlySurplus, pendingSweep } from './savings'
import type { Transaction, Budget, SavingsSweep } from '../types'

const exp = (date: string, amount: number, categoryId: string): Transaction => ({
  id: date + amount + categoryId, type: 'expense', name: 'x', amount, date, walletId: 'a', categoryId, createdAt: 0
})
const monthBudget = (categoryId: string, limit: number): Budget => ({ id: 'b-' + categoryId, categoryId, period: 'month', limit })
const weekBudget = (categoryId: string, limit: number): Budget => ({ id: 'w-' + categoryId, categoryId, period: 'week', limit })

describe('monthKeyOf', () => {
  it('trả YYYY-MM', () => {
    expect(monthKeyOf(new Date(2026, 6, 31))).toBe('2026-07')
    expect(monthKeyOf(new Date(2026, 0, 5))).toBe('2026-01')
  })
})

describe('monthlySurplus', () => {
  const ref = new Date(2026, 6, 15)
  const txns = [exp('2026-07-05', 1200000, 'food'), exp('2026-07-10', 600000, 'drink')]

  it('cộng phần dư của các hạn mức tháng, kẹp không âm', () => {
    const budgets = [monthBudget('food', 2000000), monthBudget('drink', 500000)]
    // food dư 800k; drink tiêu lố (600k/500k) → 0
    expect(monthlySurplus(budgets, txns, ref)).toBe(800000)
  })

  it('bỏ qua hạn mức đặt theo tuần', () => {
    const budgets = [monthBudget('food', 2000000), weekBudget('drink', 500000)]
    expect(monthlySurplus(budgets, txns, ref)).toBe(800000)
  })
})

describe('pendingSweep', () => {
  const now = new Date(2026, 7, 3) // 03/08 → xét tháng 7
  const budgets = [monthBudget('food', 2000000)]
  const txns = [exp('2026-07-05', 1200000, 'food')] // dư 800k

  it('trả tháng trước khi còn dư và chưa chốt', () => {
    expect(pendingSweep(now, budgets, txns, [])).toEqual({ month: '2026-07', amount: 800000 })
  })

  it('null khi tháng đó đã chốt (kể cả bỏ qua)', () => {
    const sweeps: SavingsSweep[] = [{ id: 's', month: '2026-07', amount: 0, status: 'skipped', createdAt: 0 }]
    expect(pendingSweep(now, budgets, txns, sweeps)).toBeNull()
  })

  it('null khi không còn dư', () => {
    const spent = [exp('2026-07-05', 2000000, 'food')]
    expect(pendingSweep(now, budgets, spent, [])).toBeNull()
  })

  it('null khi không có hạn mức tháng', () => {
    expect(pendingSweep(now, [weekBudget('food', 500000)], txns, [])).toBeNull()
  })
})
