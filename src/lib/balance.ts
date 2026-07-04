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

/** Tổng số dư mọi ví */
export function totalBalance(
  wallets: Wallet[],
  transactions: Transaction[],
  transfers: Transfer[]
): number {
  return wallets.reduce((sum, w) => sum + walletBalance(w, transactions, transfers), 0)
}
