import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppData, Wallet, Category, Transaction, Transfer } from '../types'
import { loadAll, dbApi } from '../db'
import { uid } from '../lib/uid'

interface Store extends AppData {
  ready: boolean
  reload: () => Promise<void>
  saveWallet: (w: Omit<Wallet, 'id' | 'createdAt'> & { id?: string }) => Promise<void>
  removeWallet: (id: string) => Promise<void>
  saveCategory: (c: Omit<Category, 'id'> & { id?: string }) => Promise<void>
  removeCategory: (id: string) => Promise<void>
  saveTransaction: (t: Omit<Transaction, 'id' | 'createdAt'> & { id?: string }) => Promise<void>
  removeTransaction: (id: string) => Promise<void>
  saveTransfer: (t: Omit<Transfer, 'id' | 'createdAt'> & { id?: string }) => Promise<void>
  removeTransfer: (id: string) => Promise<void>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ wallets: [], categories: [], transactions: [], transfers: [] })
  const [ready, setReady] = useState(false)

  const reload = async () => {
    const d = await loadAll()
    setData(d)
    setReady(true)
  }

  useEffect(() => {
    reload()
  }, [])

  const store: Store = {
    ...data,
    ready,
    reload,
    saveWallet: async (w) => {
      const wallet: Wallet = {
        id: w.id ?? uid(),
        name: w.name,
        icon: w.icon,
        color: w.color,
        initialBalance: w.initialBalance,
        createdAt: Date.now()
      }
      await dbApi.putWallet(wallet)
      await reload()
    },
    removeWallet: async (id) => {
      await dbApi.delWallet(id)
      await reload()
    },
    saveCategory: async (c) => {
      const cat: Category = { id: c.id ?? uid(), name: c.name, icon: c.icon, color: c.color, type: c.type }
      await dbApi.putCategory(cat)
      await reload()
    },
    removeCategory: async (id) => {
      await dbApi.delCategory(id)
      await reload()
    },
    saveTransaction: async (t) => {
      const txn: Transaction = {
        id: t.id ?? uid(),
        type: t.type,
        name: t.name,
        amount: t.amount,
        date: t.date,
        walletId: t.walletId,
        categoryId: t.categoryId,
        note: t.note,
        createdAt: Date.now()
      }
      await dbApi.putTransaction(txn)
      await reload()
    },
    removeTransaction: async (id) => {
      await dbApi.delTransaction(id)
      await reload()
    },
    saveTransfer: async (t) => {
      const tr: Transfer = {
        id: t.id ?? uid(),
        fromWalletId: t.fromWalletId,
        toWalletId: t.toWalletId,
        amount: t.amount,
        date: t.date,
        note: t.note,
        createdAt: Date.now()
      }
      await dbApi.putTransfer(tr)
      await reload()
    },
    removeTransfer: async (id) => {
      await dbApi.delTransfer(id)
      await reload()
    }
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore phải nằm trong StoreProvider')
  return ctx
}
