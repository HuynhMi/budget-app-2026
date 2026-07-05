import { openDB, type IDBPDatabase } from 'idb'
import type { AppData, Wallet, Category, Transaction, Transfer, Budget, SavingsSweep } from '../types'
import { defaultCategories, defaultWallets } from './seed'

const DB_NAME = 'chi-tieu-db'
const DB_VERSION = 3

type Stores = 'wallets' | 'categories' | 'transactions' | 'transfers' | 'budgets' | 'savingsSweeps'
const ALL_STORES: Stores[] = ['wallets', 'categories', 'transactions', 'transfers', 'budgets', 'savingsSweeps']

let dbPromise: Promise<IDBPDatabase> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore('wallets', { keyPath: 'id' })
          db.createObjectStore('categories', { keyPath: 'id' })
          db.createObjectStore('transactions', { keyPath: 'id' })
          db.createObjectStore('transfers', { keyPath: 'id' })
        }
        if (oldVersion < 2) {
          db.createObjectStore('budgets', { keyPath: 'id' })
        }
        if (oldVersion < 3) {
          db.createObjectStore('savingsSweeps', { keyPath: 'id' })
        }
      }
    })
  }
  return dbPromise
}

/** Đọc toàn bộ dữ liệu; seed mặc định lần đầu chạy */
export async function loadAll(): Promise<AppData> {
  const db = await getDB()
  let wallets = (await db.getAll('wallets')) as Wallet[]
  let categories = (await db.getAll('categories')) as Category[]
  const transactions = (await db.getAll('transactions')) as Transaction[]
  const transfers = (await db.getAll('transfers')) as Transfer[]
  const budgets = (await db.getAll('budgets')) as Budget[]
  const savingsSweeps = (await db.getAll('savingsSweeps')) as SavingsSweep[]

  if (categories.length === 0) {
    categories = defaultCategories()
    const tx = db.transaction('categories', 'readwrite')
    for (const c of categories) await tx.store.put(c)
    await tx.done
  }
  if (wallets.length === 0) {
    wallets = defaultWallets()
    const tx = db.transaction('wallets', 'readwrite')
    for (const w of wallets) await tx.store.put(w)
    await tx.done
  }
  return { wallets, categories, transactions, transfers, budgets, savingsSweeps }
}

async function put<T>(store: Stores, value: T): Promise<void> {
  const db = await getDB()
  await db.put(store, value)
}

async function del(store: Stores, id: string): Promise<void> {
  const db = await getDB()
  await db.delete(store, id)
}

export const dbApi = {
  putWallet: (w: Wallet) => put('wallets', w),
  delWallet: (id: string) => del('wallets', id),
  putCategory: (c: Category) => put('categories', c),
  delCategory: (id: string) => del('categories', id),
  putTransaction: (t: Transaction) => put('transactions', t),
  delTransaction: (id: string) => del('transactions', id),
  putTransfer: (t: Transfer) => put('transfers', t),
  delTransfer: (id: string) => del('transfers', id),
  putBudget: (b: Budget) => put('budgets', b),
  delBudget: (id: string) => del('budgets', id),
  putSweep: (s: SavingsSweep) => put('savingsSweeps', s)
}

/** Xoá toàn bộ dữ liệu (mọi store). Lần load kế tiếp sẽ seed lại mặc định. */
export async function resetAll(): Promise<void> {
  const db = await getDB()
  for (const store of ALL_STORES) {
    const tx = db.transaction(store, 'readwrite')
    await tx.store.clear()
    await tx.done
  }
}

/** Xuất toàn bộ dữ liệu ra chuỗi JSON để backup */
export async function exportJSON(): Promise<string> {
  const data = await loadAll()
  return JSON.stringify(data, null, 2)
}

/** Nhập dữ liệu từ JSON (ghi đè toàn bộ) */
export async function importJSON(json: string): Promise<void> {
  const data = JSON.parse(json) as AppData
  const db = await getDB()
  for (const store of ALL_STORES) {
    const tx = db.transaction(store, 'readwrite')
    await tx.store.clear()
    await tx.done
  }
  const write = async (store: Stores, items: unknown[]) => {
    const tx = db.transaction(store, 'readwrite')
    for (const it of items) await tx.store.put(it)
    await tx.done
  }
  await write('wallets', data.wallets ?? [])
  await write('categories', data.categories ?? [])
  await write('transactions', data.transactions ?? [])
  await write('transfers', data.transfers ?? [])
  await write('budgets', data.budgets ?? [])
  await write('savingsSweeps', data.savingsSweeps ?? [])
}
