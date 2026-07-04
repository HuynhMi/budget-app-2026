export type TxType = 'income' | 'expense'

export interface Wallet {
  id: string
  name: string
  icon: string
  color: string
  initialBalance: number
  createdAt: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TxType
}

export interface Transaction {
  id: string
  type: TxType
  name: string
  amount: number
  date: string // YYYY-MM-DD
  walletId: string
  categoryId: string
  note?: string
  createdAt: number
}

export interface Transfer {
  id: string
  fromWalletId: string
  toWalletId: string
  amount: number
  date: string // YYYY-MM-DD
  note?: string
  createdAt: number
}

export interface AppData {
  wallets: Wallet[]
  categories: Category[]
  transactions: Transaction[]
  transfers: Transfer[]
}
