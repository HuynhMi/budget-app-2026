import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { TxnRow, categoryById, walletById } from '../components/TxnRow'
import { AddTransactionSheet } from './AddTransactionSheet'
import {
  parseISO,
  startOfWeek,
  startOfMonth,
  startOfYear,
  inRange,
  todayISO
} from '../lib/dates'
import type { Transaction } from '../types'

type Filter = 'all' | 'today' | 'week' | 'month' | 'year'

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'today', label: 'Hôm nay' },
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' }
]

interface Item {
  id: string
  date: string
  createdAt: number
  icon: string
  color: string
  title: string
  subtitle: string
  amount: number
  kind: 'income' | 'expense' | 'transfer'
  txn?: Transaction
}

export function HistoryScreen() {
  const store = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [walletFilter, setWalletFilter] = useState<string>('')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const now = new Date()
  const passPeriod = (dateISO: string) => {
    if (filter === 'all') return true
    if (filter === 'today') return dateISO === todayISO()
    if (filter === 'week') return inRange(dateISO, startOfWeek(now), now)
    if (filter === 'month') return inRange(dateISO, startOfMonth(now), now)
    if (filter === 'year') return inRange(dateISO, startOfYear(now), now)
    return true
  }

  const items = useMemo<Item[]>(() => {
    const list: Item[] = []
    for (const t of store.transactions) {
      if (!passPeriod(t.date)) continue
      if (walletFilter && t.walletId !== walletFilter) continue
      const cat = categoryById(store.categories, t.categoryId)
      const w = walletById(store.wallets, t.walletId)
      list.push({
        id: t.id,
        date: t.date,
        createdAt: t.createdAt,
        icon: cat?.icon ?? '🏷️',
        color: cat?.color ?? '#c084fc',
        title: t.name,
        subtitle: `${cat?.name ?? ''} · ${w?.name ?? ''}`,
        amount: t.amount,
        kind: t.type,
        txn: t
      })
    }
    for (const tr of store.transfers) {
      if (!passPeriod(tr.date)) continue
      if (walletFilter && tr.fromWalletId !== walletFilter && tr.toWalletId !== walletFilter) continue
      const from = walletById(store.wallets, tr.fromWalletId)
      const to = walletById(store.wallets, tr.toWalletId)
      list.push({
        id: tr.id,
        date: tr.date,
        createdAt: tr.createdAt,
        icon: '🔄',
        color: '#a855f7',
        title: 'Chuyển tiền',
        subtitle: `${from?.name ?? '?'} → ${to?.name ?? '?'}`,
        amount: tr.amount,
        kind: 'transfer'
      })
    }
    return list.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date < a.date ? -1 : 1))
  }, [store.transactions, store.transfers, filter, walletFilter, store.categories, store.wallets])

  // Nhóm theo ngày
  const groups = useMemo(() => {
    const m = new Map<string, Item[]>()
    for (const it of items) {
      if (!m.has(it.date)) m.set(it.date, [])
      m.get(it.date)!.push(it)
    }
    return [...m.entries()]
  }, [items])

  return (
    <div className="screen-pad pt-12">
      <h1 className="text-2xl font-extrabold mb-4">Lịch sử</h1>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`chip ${filter === f.key ? 'chip-on' : 'chip-off'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        <button onClick={() => setWalletFilter('')} className={`chip ${walletFilter === '' ? 'chip-on' : 'chip-off'}`}>
          Mọi ví
        </button>
        {store.wallets.map((w) => (
          <button
            key={w.id}
            onClick={() => setWalletFilter(w.id)}
            className={`chip ${walletFilter === w.id ? 'chip-on' : 'chip-off'}`}
          >
            {w.icon} {w.name}
          </button>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="card py-10 text-center text-muted text-sm">Không có giao dịch nào.</div>
      )}

      <div className="space-y-4">
        {groups.map(([date, its]) => (
          <div key={date}>
            <div className="text-xs font-semibold text-muted mb-1 px-1">{formatDateVi(date)}</div>
            <div className="card px-4 divide-y divide-brand-50">
              {its.map((it) => (
                <TxnRow
                  key={it.id}
                  icon={it.icon}
                  color={it.color}
                  title={it.title}
                  subtitle={it.subtitle}
                  amount={it.amount}
                  kind={it.kind}
                  onClick={it.txn ? () => setEditing(it.txn!) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <AddTransactionSheet
        open={!!editing}
        editTxn={editing ?? undefined}
        onClose={() => setEditing(null)}
      />
    </div>
  )
}

function formatDateVi(iso: string): string {
  const d = parseISO(iso)
  if (iso === todayISO()) return 'Hôm nay'
  return `${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}
