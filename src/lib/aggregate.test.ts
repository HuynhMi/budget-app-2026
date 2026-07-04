import { describe, it, expect } from 'vitest'
import { buildSeries, sumTotals, byCategory, lastNMonths, monthlyByCategory } from './aggregate'
import type { Transaction, Category } from '../types'

const cats: Category[] = [
  { id: 'food', name: 'Ăn uống', icon: '🍜', color: '#f472b6', type: 'expense' },
  { id: 'shop', name: 'Mua sắm', icon: '🛍️', color: '#a855f7', type: 'expense' }
]

const txns: Transaction[] = [
  { id: '1', type: 'expense', name: 'Phở', amount: 50000, date: '2026-07-01', walletId: 'a', categoryId: 'food', createdAt: 0 },
  { id: '2', type: 'expense', name: 'Áo', amount: 300000, date: '2026-07-01', walletId: 'a', categoryId: 'shop', createdAt: 0 },
  { id: '3', type: 'income', name: 'Lương', amount: 1000000, date: '2026-07-15', walletId: 'a', categoryId: 'sal', createdAt: 0 },
  { id: '4', type: 'expense', name: 'Cơm', amount: 40000, date: '2026-06-10', walletId: 'a', categoryId: 'food', createdAt: 0 }
]

describe('sumTotals', () => {
  it('tổng thu và chi', () => {
    expect(sumTotals(txns)).toEqual({ income: 1000000, expense: 390000 })
  })
})

describe('byCategory', () => {
  it('gộp theo danh mục chi, sắp xếp giảm dần', () => {
    const slices = byCategory(txns, cats, 'expense')
    expect(slices[0]).toMatchObject({ categoryId: 'shop', total: 300000 })
    expect(slices[1]).toMatchObject({ categoryId: 'food', total: 90000 })
  })
})

describe('buildSeries', () => {
  it('year: 12 tháng, gộp đúng tháng', () => {
    const s = buildSeries(txns, 'year', new Date(2026, 6, 1))
    expect(s).toHaveLength(12)
    // Tháng 7 (index 6): expense 350000, income 1000000
    expect(s[6]).toMatchObject({ expense: 350000, income: 1000000 })
    // Tháng 6 (index 5): expense 40000
    expect(s[5].expense).toBe(40000)
  })
  it('month: đúng số ngày và gộp theo ngày', () => {
    const s = buildSeries(txns, 'month', new Date(2026, 6, 1))
    expect(s).toHaveLength(31)
    expect(s[0].expense).toBe(350000) // ngày 1
    expect(s[14].income).toBe(1000000) // ngày 15
  })
})

describe('monthlyByCategory', () => {
  it('cột chồng theo danh mục, tổng đúng, cats sắp giảm dần', () => {
    const { data, cats } = monthlyByCategory(txns, cats0(), new Date(2026, 6, 15), 6)
    const jul = data[5]
    expect(jul.isCurrent).toBe(true)
    expect(jul.total).toBe(350000) // food 50k + shop 300k
    expect(jul['food']).toBe(50000)
    expect(jul['shop']).toBe(300000)
    // tháng 6 chỉ có food 40k
    expect(data[4]['food']).toBe(40000)
    expect(data[4].total).toBe(40000)
    // shop (300k) đứng trước food (90k)
    expect(cats.map((c) => c.id)).toEqual(['shop', 'food'])
  })
})
function cats0() {
  return [
    { id: 'food', name: 'Ăn uống', icon: '🍜', color: '#f472b6', type: 'expense' as const },
    { id: 'shop', name: 'Mua sắm', icon: '🛍️', color: '#a855f7', type: 'expense' as const }
  ]
}

describe('lastNMonths', () => {
  it('trả về N tháng, cũ -> mới, đánh dấu tháng hiện tại', () => {
    const s = lastNMonths(txns, new Date(2026, 6, 15), 6) // T2..T7
    expect(s).toHaveLength(6)
    expect(s.map((p) => p.label)).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'])
    expect(s[5].isCurrent).toBe(true)
    expect(s[5].expense).toBe(350000) // tháng 7
    expect(s[5].income).toBe(1000000)
    expect(s[4].expense).toBe(40000) // tháng 6
  })
})
