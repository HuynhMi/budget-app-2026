import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts'
import { useStore } from '../state/store'
import { walletBalance, totalBalance } from '../lib/balance'
import { formatVND, formatShort } from '../lib/money'
import { buildSeries, sumTotals } from '../lib/aggregate'
import { startOfMonth, toISO, inRange, parseISO } from '../lib/dates'
import { TxnRow, categoryById, walletById } from '../components/TxnRow'
import type { Screen } from '../App'

export function HomeScreen({ onNavigate, onAdd }: { onNavigate: (s: Screen) => void; onAdd: () => void }) {
  const store = useStore()
  const total = totalBalance(store.wallets, store.transactions, store.transfers)

  const now = new Date()
  const monthTxns = useMemo(
    () =>
      store.transactions.filter((t) =>
        inRange(t.date, startOfMonth(now), new Date(now.getFullYear(), now.getMonth() + 1, 0))
      ),
    [store.transactions]
  )
  const { income, expense } = sumTotals(monthTxns)

  const series = useMemo(() => buildSeries(store.transactions, 'month', now), [store.transactions])

  const recent = useMemo(
    () => [...store.transactions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
    [store.transactions]
  )

  return (
    <div>
      {/* Header gradient */}
      <div className="bg-gradient-to-br from-brand-300 via-brand-200 to-pinkish-400/60 rounded-b-[2.5rem] px-5 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white/60 flex items-center justify-center text-xl">👋</div>
            <div>
              <div className="text-xs text-brand-700/70">Xin chào</div>
              <div className="font-bold text-ink">Chủ ví</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('scan')}
            className="h-11 px-4 rounded-full bg-white/80 backdrop-blur text-sm font-semibold text-brand-600 shadow-soft flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            📷 Quét giá
          </button>
        </div>

        <div className="text-brand-700/70 text-sm">Tổng số dư</div>
        <div className="text-4xl font-extrabold text-ink tracking-tight mt-1">{formatVND(total)}</div>

        <div className="flex gap-3 mt-5">
          <div className="flex-1 bg-white/70 backdrop-blur rounded-2xl px-4 py-3">
            <div className="text-xs text-muted flex items-center gap-1">↓ Thu tháng này</div>
            <div className="font-bold text-green-600">{formatVND(income)}</div>
          </div>
          <div className="flex-1 bg-white/70 backdrop-blur rounded-2xl px-4 py-3">
            <div className="text-xs text-muted flex items-center gap-1">↑ Chi tháng này</div>
            <div className="font-bold text-pinkish-500">{formatVND(expense)}</div>
          </div>
        </div>
      </div>

      <div className="screen-pad">
        {/* Ví */}
        <div className="flex items-center justify-between mt-5 mb-3">
          <h2 className="font-bold text-lg">Ví của tôi</h2>
          <button onClick={() => onNavigate('wallets')} className="text-sm text-brand-500 font-medium">
            Xem tất cả ›
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {store.wallets.map((w) => (
            <div
              key={w.id}
              className="min-w-[150px] rounded-3xl p-4 text-white shadow-soft"
              style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color}cc)` }}
            >
              <div className="text-2xl">{w.icon}</div>
              <div className="text-sm/5 mt-2 opacity-90">{w.name}</div>
              <div className="font-bold text-lg mt-0.5">
                {formatVND(walletBalance(w, store.transactions, store.transfers))}
              </div>
            </div>
          ))}
        </div>

        {/* Biểu đồ */}
        <div className="card p-4 mt-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold">Chi tiêu tháng này</h2>
            <button onClick={() => onNavigate('reports')} className="text-xs text-brand-500 font-medium">
              Chi tiết ›
            </button>
          </div>
          <div className="text-2xl font-extrabold text-pinkish-500">{formatVND(expense)}</div>
          <div className="h-32 mt-2 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <Tooltip
                  formatter={(v: number) => formatVND(v)}
                  labelFormatter={(l) => `Ngày ${l}`}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(120,80,200,.15)', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#ec4899"
                  strokeWidth={2.5}
                  fill="url(#expGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gần đây */}
        <div className="flex items-center justify-between mt-6 mb-1">
          <h2 className="font-bold text-lg">Gần đây</h2>
          <button onClick={() => onNavigate('history')} className="text-sm text-brand-500 font-medium">
            Tất cả ›
          </button>
        </div>
        <div className="card px-4 divide-y divide-brand-50">
          {recent.length === 0 && (
            <div className="py-8 text-center text-muted text-sm">
              Chưa có giao dịch. Bấm <b className="text-brand-500">+</b> để thêm.
            </div>
          )}
          {recent.map((t) => {
            const cat = categoryById(store.categories, t.categoryId)
            const w = walletById(store.wallets, t.walletId)
            return (
              <TxnRow
                key={t.id}
                icon={cat?.icon ?? '🏷️'}
                color={cat?.color ?? '#c084fc'}
                title={t.name}
                subtitle={`${cat?.name ?? ''} · ${w?.name ?? ''}`}
                amount={t.amount}
                kind={t.type}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
