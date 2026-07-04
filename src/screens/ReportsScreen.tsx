import { useMemo, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts'
import { useStore } from '../state/store'
import { buildSeries, sumTotals, byCategory } from '../lib/aggregate'
import { formatVND, formatShort } from '../lib/money'
import {
  type Period,
  startOfWeek,
  startOfMonth,
  startOfYear,
  inRange
} from '../lib/dates'
import { budgetStatus } from '../lib/budget'
import type { Screen } from '../App'

const PERIODS: Array<{ key: Period; label: string }> = [
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'year', label: 'Năm' }
]

export function ReportsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const store = useStore()
  const [period, setPeriod] = useState<Period>('month')
  const now = new Date()

  const series = useMemo(() => buildSeries(store.transactions, period, now), [store.transactions, period])

  const periodTxns = useMemo(() => {
    const from = period === 'week' ? startOfWeek(now) : period === 'month' ? startOfMonth(now) : startOfYear(now)
    const to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return store.transactions.filter((t) => inRange(t.date, from, to))
  }, [store.transactions, period])

  const { income, expense } = sumTotals(periodTxns)
  const catSlices = useMemo(() => byCategory(periodTxns, store.categories, 'expense'), [periodTxns, store.categories])
  const maxCat = catSlices[0]?.total ?? 1

  return (
    <div className="screen-pad pt-12">
      <h1 className="text-2xl font-extrabold mb-4">Thống kê</h1>

      <div className="grid grid-cols-3 gap-2 bg-brand-50 p-1 rounded-2xl mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`py-2 rounded-xl font-semibold text-sm transition-colors ${
              period === p.key ? 'bg-white text-brand-600 shadow-soft' : 'text-muted'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Ngân sách theo danh mục */}
      <BudgetCard onOpen={() => onNavigate('budget')} />

      {/* Tổng thu chi */}
      <div className="flex gap-3 mb-4">
        <div className="card flex-1 p-4">
          <div className="text-xs text-muted">Thu nhập</div>
          <div className="font-bold text-green-600 text-lg">{formatVND(income)}</div>
        </div>
        <div className="card flex-1 p-4">
          <div className="text-xs text-muted">Chi tiêu</div>
          <div className="font-bold text-pinkish-500 text-lg">{formatVND(expense)}</div>
        </div>
      </div>

      {/* Line chart */}
      <div className="card p-4 mb-4">
        <h2 className="font-bold mb-3">Thu & chi theo {period === 'week' ? 'ngày' : period === 'month' ? 'ngày' : 'tháng'}</h2>
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee6fb" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8b849c' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => formatShort(v)} tick={{ fontSize: 10, fill: '#8b849c' }} width={38} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name) => [formatVND(v), name === 'income' ? 'Thu' : 'Chi']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(120,80,200,.15)', fontSize: 12 }}
              />
              <Legend
                formatter={(v) => (v === 'income' ? 'Thu nhập' : 'Chi tiêu')}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="expense" stroke="#ec4899" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Theo danh mục (tổng cho kỳ đang chọn) */}
      <div className="card p-4">
        <h2 className="font-bold mb-3">Chi tiêu theo danh mục</h2>
        {catSlices.length === 0 && <div className="text-muted text-sm py-4 text-center">Chưa có chi tiêu.</div>}
        <div className="space-y-3">
          {catSlices.map((c) => (
            <div key={c.categoryId}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="flex items-center gap-2">
                  <span>{c.icon}</span>
                  <span className="font-medium">{c.name}</span>
                </span>
                <span className="font-semibold">{formatVND(c.total)}</span>
              </div>
              <div className="h-2 rounded-full bg-brand-50 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(6, (c.total / maxCat) * 100)}%`, backgroundColor: c.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BudgetCard({ onOpen }: { onOpen: () => void }) {
  const store = useStore()
  const now = new Date()
  const statuses = store.budgets.map((b) => budgetStatus(b, store.transactions, now))
  const overCount = statuses.filter((s) => s.level === 'over').length
  const warnCount = statuses.filter((s) => s.level === 'warn').length

  return (
    <button onClick={onOpen} className="card p-4 w-full text-left mb-4 active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between">
        <h2 className="font-bold flex items-center gap-2">🎯 Ngân sách danh mục</h2>
        <span className="text-sm text-brand-500 font-medium">Quản lý ›</span>
      </div>
      {statuses.length === 0 ? (
        <p className="text-xs text-muted mt-1">Đặt hạn mức để không tiêu lố cho từng danh mục.</p>
      ) : (
        <div className="flex gap-2 mt-2 flex-wrap">
          <span className="text-xs bg-brand-50 text-brand-600 rounded-full px-3 py-1">{statuses.length} hạn mức</span>
          {overCount > 0 && (
            <span className="text-xs bg-red-50 text-red-500 rounded-full px-3 py-1">⚠️ {overCount} vượt mức</span>
          )}
          {warnCount > 0 && (
            <span className="text-xs bg-orange-50 text-orange-500 rounded-full px-3 py-1">{warnCount} sắp hết</span>
          )}
        </div>
      )}
    </button>
  )
}
