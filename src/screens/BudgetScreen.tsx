import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { Sheet } from '../components/Sheet'
import { BudgetProgressRow } from '../components/BudgetProgressRow'
import { MoneyInput } from '../components/MoneyInput'
import { formatVND, parseVND } from '../lib/money'
import { budgetStatus } from '../lib/budget'
import type { Budget, BudgetPeriod, Category } from '../types'

export function BudgetScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()
  const [editing, setEditing] = useState<Budget | 'new' | null>(null)
  const now = new Date()

  const statuses = useMemo(
    () => store.budgets.map((b) => budgetStatus(b, store.transactions, now)),
    [store.budgets, store.transactions]
  )

  const catName = (id: string) => store.categories.find((c) => c.id === id)
  const budgetedCatIds = new Set(store.budgets.map((b) => b.categoryId))
  const availableCats = store.categories.filter((c) => c.type === 'expense' && !budgetedCatIds.has(c.id))

  return (
    <div className="min-h-screen bg-[#f6f2ff]">
      <div className="bg-gradient-to-br from-brand-300 to-pinkish-400/70 px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-2xl text-ink" aria-label="Quay lại">‹</button>
          <div>
            <h1 className="text-xl font-extrabold">Ngân sách</h1>
            <p className="text-ink/60 text-xs">Đặt hạn mức chi mỗi danh mục để không tiêu lố</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 pt-4">
        {statuses.length === 0 && (
          <div className="card p-8 text-center text-muted text-sm">
            Chưa có hạn mức nào. Bấm nút bên dưới để đặt hạn mức cho danh mục, VD “Ăn uống tối đa 3.000.000đ / tháng”.
          </div>
        )}

        <div className="space-y-3">
          {statuses.map((s) => (
            <button
              key={s.budget.id}
              onClick={() => setEditing(s.budget)}
              className="card p-4 w-full text-left active:scale-[0.99] transition-transform"
            >
              <BudgetProgressRow status={s} category={catName(s.budget.categoryId)} />
            </button>
          ))}
        </div>

        <button
          onClick={() => setEditing('new')}
          className="btn-primary mt-5"
          disabled={availableCats.length === 0 && editing !== 'new'}
        >
          ＋ Đặt hạn mức mới
        </button>
        {availableCats.length === 0 && statuses.length > 0 && (
          <p className="text-xs text-muted text-center mt-2">Mọi danh mục chi đã có hạn mức.</p>
        )}
      </div>

      {editing && (
        <BudgetEditor
          budget={editing === 'new' ? null : editing}
          availableCats={availableCats}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function BudgetEditor({
  budget,
  availableCats,
  onClose
}: {
  budget: Budget | null
  availableCats: Category[]
  onClose: () => void
}) {
  const store = useStore()
  const editingCat = budget ? store.categories.find((c) => c.id === budget.categoryId) : undefined
  const cats = budget && editingCat ? [editingCat] : availableCats

  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? cats[0]?.id ?? '')
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? 'month')
  const [limitStr, setLimitStr] = useState(budget ? String(budget.limit) : '')
  const [error, setError] = useState('')

  const save = async () => {
    const limit = parseVND(limitStr)
    if (!categoryId) return setError('Chọn danh mục')
    if (limit <= 0) return setError('Nhập hạn mức hợp lệ')
    await store.saveBudget({ id: budget?.id, categoryId, period, limit })
    onClose()
  }
  const remove = async () => {
    if (!budget) return
    await store.removeBudget(budget.id)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={budget ? 'Sửa hạn mức' : 'Đặt hạn mức'}>
      <label className="block text-sm font-medium text-muted mb-1.5">Danh mục chi</label>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            disabled={!!budget}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all ${
              categoryId === c.id ? 'bg-brand-100 ring-2 ring-brand-400' : 'bg-white'
            } ${budget ? 'opacity-100' : ''}`}
          >
            <span className="h-9 w-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: c.color + '22' }}>
              {c.icon}
            </span>
            <span className="text-[10px] text-center leading-tight text-muted">{c.name}</span>
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-muted mb-1.5">Kỳ hạn</label>
      <div className="grid grid-cols-2 gap-2 bg-brand-50 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setPeriod('month')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${period === 'month' ? 'bg-brand-500 text-white shadow-soft' : 'text-muted'}`}
        >
          Theo tháng
        </button>
        <button
          onClick={() => setPeriod('week')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${period === 'week' ? 'bg-brand-500 text-white shadow-soft' : 'text-muted'}`}
        >
          Theo tuần
        </button>
      </div>

      <label className="block text-sm font-medium text-muted mb-1.5">Hạn mức tối đa</label>
      <MoneyInput
        className="field text-xl font-bold"
        suffixClassName="text-lg"
        placeholder="VD: 3.000.000"
        value={limitStr}
        onChange={setLimitStr}
      />
      <div className="text-right text-sm text-brand-500 font-medium mb-4 h-5">
        {parseVND(limitStr) > 0 ? `${formatVND(parseVND(limitStr))} / ${period === 'month' ? 'tháng' : 'tuần'}` : ''}
      </div>

      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary mb-2" onClick={save}>Lưu hạn mức</button>
      {budget && <button className="w-full py-3 text-pinkish-500 font-medium" onClick={remove}>Xoá hạn mức</button>}
    </Sheet>
  )
}
