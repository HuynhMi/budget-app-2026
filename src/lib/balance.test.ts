import { describe, it, expect } from 'vitest'
import { walletBalance, totalBalance, spendableBalance, excludedBalance } from './balance'
import type { Wallet, Transaction, Transfer } from '../types'

const wA: Wallet = { id: 'a', name: 'Tiền mặt', icon: '💵', color: '#a855f7', initialBalance: 100000, createdAt: 0 }
const wB: Wallet = { id: 'b', name: 'Ngân hàng', icon: '🏦', color: '#ec4899', initialBalance: 500000, createdAt: 0 }

const txns: Transaction[] = [
  { id: 't1', type: 'income', name: 'Lương', amount: 200000, date: '2026-07-01', walletId: 'a', categoryId: 'c1', createdAt: 0 },
  { id: 't2', type: 'expense', name: 'Ăn', amount: 50000, date: '2026-07-02', walletId: 'a', categoryId: 'c2', createdAt: 0 }
]

const transfers: Transfer[] = [
  { id: 'tr1', fromWalletId: 'a', toWalletId: 'b', amount: 30000, date: '2026-07-03', createdAt: 0 }
]

describe('walletBalance', () => {
  it('cộng thu, trừ chi, trừ chuyển đi', () => {
    // 100000 + 200000 - 50000 - 30000 = 220000
    expect(walletBalance(wA, txns, transfers)).toBe(220000)
  })
  it('cộng chuyển đến', () => {
    // 500000 + 30000 = 530000
    expect(walletBalance(wB, txns, transfers)).toBe(530000)
  })
})

describe('totalBalance', () => {
  it('tổng mọi ví, transfer nội bộ triệt tiêu', () => {
    // 220000 + 530000 = 750000  (= 100000+500000+200000-50000)
    expect(totalBalance([wA, wB], txns, transfers)).toBe(750000)
  })
})

describe('spendable/excluded balance', () => {
  const savings: Wallet = { ...wB, excludeFromTotal: true } // ví B là tiết kiệm
  it('tiền có thể chi tiêu bỏ ví tiết kiệm', () => {
    expect(spendableBalance([wA, savings], txns, transfers)).toBe(220000)
  })
  it('tổng tiết kiệm/tài sản khác', () => {
    expect(excludedBalance([wA, savings], txns, transfers)).toBe(530000)
  })
  it('spendable + excluded = tổng tài sản', () => {
    expect(spendableBalance([wA, savings], txns, transfers) + excludedBalance([wA, savings], txns, transfers))
      .toBe(totalBalance([wA, savings], txns, transfers))
  })
})
