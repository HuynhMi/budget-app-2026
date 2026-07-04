import type { Wallet, Transaction, Transfer } from '../types'

/** Số dư của 1 ví = số dư ban đầu + thu - chi - chuyển đi + chuyển đến */
export function walletBalance(
  wallet: Wallet,
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  let balance = wallet.initialBalance
  for (const t of transactions) {
    if (t.walletId !== wallet.id) continue
    balance += t.type === 'income' ? t.amount : -t.amount
  }
  for (const tr of transfers) {
    if (tr.fromWalletId === wallet.id) balance -= tr.amount
    if (tr.toWalletId === wallet.id) balance += tr.amount
  }
  return balance
}

/** Tổng số dư mọi ví (tổng tài sản) */
export function totalBalance(
  wallets: Wallet[],
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  return wallets.reduce((sum, w) => sum + walletBalance(w, transactions, transfers), 0)
}

/** Tiền có thể chi tiêu = tổng các ví KHÔNG bị loại khỏi tổng */
export function spendableBalance(
  wallets: Wallet[],
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  return wallets
    .filter((w) => !w.excludeFromTotal)
    .reduce((sum, w) => sum + walletBalance(w, transactions, transfers), 0)
}

/** Tổng các ví bị loại khỏi tổng (tiết kiệm & tài sản khác) */
export function excludedBalance(
  wallets: Wallet[],
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  return wallets
    .filter((w) => w.excludeFromTotal)
    .reduce((sum, w) => sum + walletBalance(w, transactions, transfers), 0)
}
