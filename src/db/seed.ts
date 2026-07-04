import type { Wallet, Category } from '../types'

// Dùng ID CỐ ĐỊNH cho dữ liệu mặc định để việc seed là idempotent:
// nếu seed chạy nhiều lần (vd StrictMode gọi effect 2 lần), put() cùng key
// sẽ ghi đè thay vì tạo bản ghi trùng.

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
    ...expense.map(([name, icon, color], i) => ({ id: `cat-e-${i}`, name, icon, color, type: 'expense' as const })),
    ...income.map(([name, icon, color], i) => ({ id: `cat-i-${i}`, name, icon, color, type: 'income' as const }))
  ]
}

export function defaultWallets(): Wallet[] {
  return [
    { id: 'wallet-cash', name: 'Tiền mặt', icon: '💵', color: '#a855f7', initialBalance: 0, createdAt: 0 },
    { id: 'wallet-bank', name: 'Ngân hàng', icon: '🏦', color: '#ec4899', initialBalance: 0, createdAt: 0 }
  ]
}
