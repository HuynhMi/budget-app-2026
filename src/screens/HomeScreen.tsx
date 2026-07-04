import { useMemo } from 'react'
import { useStore } from '../state/store'
import { walletBalance, spendableBalance, excludedBalance } from '../lib/balance'
import { formatVND } from '../lib/money'
import { sumTotals } from '../lib/aggregate'
import { budgetStatus } from '../lib/budget'
import { startOfMonth, inRange } from '../lib/dates'
import { TxnRow, categoryById, walletById } from '../components/TxnRow'
import { BudgetProgressRow } from '../components/BudgetProgressRow'
import type { Screen } from '../App'

export function HomeScreen({ onNavigate, onAdd }: { onNavigate: (s: Screen) => void; onAdd: () => void }) {
  const store = useStore()
  const spendable = spendableBalance(store.wallets, store.transactions, store.transfers)
  const savings = excludedBalance(store.wallets, store.transactions, store.transfers)
  const hasExcluded = store.wallets.some((w) => w.excludeFromTotal)

  const now = new Date()
  const monthTxns = useMemo(
    () =>
      store.transactions.filter((t) =>
        inRange(t.date, startOfMonth(now), new Date(now.getFullYear(), now.getMonth() + 1, 0))
      ),
    [store.transactions]
  )
  const { income, expense } = sumTotals(monthTxns)

  const budgetStatuses = useMemo(
    () => store.budgets.map((b) => budgetStatus(b, store.transactions, now)).sort((a, b) => b.ratio - a.ratio),
    [store.budgets, store.transactions]
  )

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

        <div className="text-brand-700/70 text-sm">Có thể chi tiêu</div>
        <div className="text-4xl font-extrabold text-ink tracking-tight mt-1">{formatVND(spendable)}</div>
        {hasExcluded && (
          <div className="text-xs text-brand-700/70 mt-1">
            🔒 Tiết kiệm & tài sản khác: <b className="text-ink/80">{formatVND(savings)}</b>
          </div>
        )}

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

        {/* Ngân sách tháng này */}
        <div className="card p-4 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">🎯 Ngân sách tháng này</h2>
            <button onClick={() => onNavigate('budget')} className="text-xs text-brand-500 font-medium">
              {budgetStatuses.length > 0 ? 'Quản lý ›' : ''}
            </button>
          </div>

          {budgetStatuses.length === 0 ? (
            <button
              onClick={() => onNavigate('budget')}
              className="w-full text-center py-4 text-sm text-muted active:opacity-70"
            >
              Chưa đặt hạn mức nào.
              <span className="text-brand-500 font-medium"> Đặt hạn mức chi</span> cho danh mục để theo dõi ngay đây.
            </button>
          ) : (
            <>
              <div className="space-y-3">
                {budgetStatuses.slice(0, 4).map((s) => (
                  <BudgetProgressRow
                    key={s.budget.id}
                    status={s}
                    category={categoryById(store.categories, s.budget.categoryId)}
                    compact
                  />
                ))}
              </div>
              {budgetStatuses.length > 4 && (
                <button
                  onClick={() => onNavigate('budget')}
                  className="w-full text-center text-sm text-brand-500 font-medium mt-3 pt-1"
                >
                  Xem tất cả {budgetStatuses.length} hạn mức ›
                </button>
              )}
            </>
          )}
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
