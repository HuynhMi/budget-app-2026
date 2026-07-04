import type { Wallet, Category } from '../types'
import { uid } from '../lib/uid'

export function defaultCategories(): Category[] {
  const expense: Array<[string, string, string]> = [
    ['Ăn uống', '🍜', '#f472b6'],
    ['Mua sắm', '🛍️', '#a855f7'],
    ['Di chuyển', '🚕', '#818cf8'],
    ['Hoá đơn', '🧾', '#22d3ee'],
    ['Giải trí', '🎬', '#fb923c'],
    ['Sức khoẻ', '💊', '#34d399'],
    ['Nhà cửa', '🏠', '#f59e0b'],
    ['Khác', '🏷️', '#94a3b8']
  ]
  const income: Array<[string, string, string]> = [
    ['Lương', '💼', '#22c55e'],
    ['Thưởng', '🎁', '#eab308'],
    ['Đầu tư', '📈', '#06b6d4'],
    ['Khác', '💰', '#84cc16']
  ]
  return [
    ...expense.map(([name, icon, color]) => ({ id: uid(), name, icon, color, type: 'expense' as const })),
    ...income.map(([name, icon, color]) => ({ id: uid(), name, icon, color, type: 'income' as const }))
  ]
}

export function defaultWallets(): Wallet[] {
  return [
    { id: uid(), name: 'Tiền mặt', icon: '💵', color: '#a855f7', initialBalance: 0, createdAt: Date.now() },
    { id: uid(), name: 'Ngân hàng', icon: '🏦', color: '#ec4899', initialBalance: 0, createdAt: Date.now() }
  ]
}
