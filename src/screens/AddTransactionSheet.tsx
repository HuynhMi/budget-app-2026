import { useEffect, useMemo, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { MoneyInput } from '../components/MoneyInput'
import { useStore } from '../state/store'
import { parseVND, formatVND } from '../lib/money'
import { todayISO, parseISO } from '../lib/dates'
import { spentInPeriod } from '../lib/budget'
import type { TxType, Transaction } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  /** Giá trị điền sẵn (vd từ màn hình quét) */
  prefill?: { name?: string; amount?: number; type?: TxType }
  /** Nếu có: chế độ sửa giao dịch đã tồn tại */
  editTxn?: Transaction
  onSaved?: () => void
}

export function AddTransactionSheet({ open, onClose, prefill, editTxn, onSaved }: Props) {
  const store = useStore()
  const isEdit = !!editTxn
  const [type, setType] = useState<TxType>('expense')
  const [name, setName] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [date, setDate] = useState(todayISO())
  const [walletId, setWalletId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')

  const cats = useMemo(() => store.categories.filter((c) => c.type === type), [store.categories, type])

  // Khởi tạo khi mở
  useEffect(() => {
    if (open) {
      if (editTxn) {
        setType(editTxn.type)
        setName(editTxn.name)
        setAmountStr(String(editTxn.amount))
        setDate(editTxn.date)
        setWalletId(editTxn.walletId)
        setCategoryId(editTxn.categoryId)
      } else {
        setType(prefill?.type ?? 'expense')
        setName(prefill?.name ?? '')
        setAmountStr(prefill?.amount ? String(prefill.amount) : '')
        setDate(todayISO())
        // Ưu tiên ví chi tiêu (không phải ví tiết kiệm) làm mặc định
        setWalletId(store.wallets.find((w) => !w.excludeFromTotal)?.id ?? store.wallets[0]?.id ?? '')
      }
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Chọn danh mục đầu tiên khi đổi loại
  useEffect(() => {
    if (!cats.find((c) => c.id === categoryId)) setCategoryId(cats[0]?.id ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, store.categories])

  const amount = parseVND(amountStr)

  // Cảnh báo hạn mức: nếu là chi và danh mục có hạn mức
  const budgetWarn = useMemo(() => {
    if (type !== 'expense' || !categoryId) return null
    const b = store.budgets.find((x) => x.categoryId === categoryId)
    if (!b) return null
    const ref = date ? parseISO(date) : new Date()
    // Khi sửa: loại chính giao dịch đang sửa khỏi "đã chi" để không cộng trùng
    const others = editTxn ? store.transactions.filter((t) => t.id !== editTxn.id) : store.transactions
    const already = spentInPeriod(categoryId, b.period, others, ref)
    const after = already + amount
    if (after <= b.limit) {
      if (already >= b.limit * 0.8) {
        return { level: 'warn' as const, text: `Sắp chạm hạn mức: ${formatVND(after)} / ${formatVND(b.limit)} ${b.period === 'month' ? 'tháng' : 'tuần'} này` }
      }
      return null
    }
    return {
      level: 'over' as const,
      text: `Vượt hạn mức ${b.period === 'month' ? 'tháng' : 'tuần'}! ${formatVND(after)} / ${formatVND(b.limit)} (dư ${formatVND(after - b.limit)})`
    }
  }, [type, categoryId, amount, date, store.budgets, store.transactions])

  const submit = async () => {
    if (amount <= 0) return setError('Nhập số tiền hợp lệ')
    if (!walletId) return setError('Chọn ví')
    if (!categoryId) return setError('Chọn danh mục')
    await store.saveTransaction({
      id: editTxn?.id,
      type,
      name: name.trim() || (type === 'expense' ? 'Chi tiêu' : 'Thu nhập'),
      amount,
      date,
      walletId,
      categoryId
    })
    onClose()
    onSaved?.()
  }

  const remove = async () => {
    if (!editTxn) return
    if (!confirm('Xoá giao dịch này?')) return
    await store.removeTransaction(editTxn.id)
    onClose()
    onSaved?.()
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'Sửa giao dịch' : 'Thêm giao dịch'}>
      {/* Chọn loại */}
      <div className="grid grid-cols-2 gap-2 bg-brand-50 p-1 rounded-2xl mb-4">
        <button
          onClick={() => setType('expense')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${
            type === 'expense' ? 'bg-pinkish-500 text-white shadow-soft' : 'text-muted'
          }`}
        >
          Chi tiêu
        </button>
        <button
          onClick={() => setType('income')}
          className={`py-2.5 rounded-xl font-semibold transition-colors ${
            type === 'income' ? 'bg-green-500 text-white shadow-soft' : 'text-muted'
          }`}
        >
          Thu nhập
        </button>
      </div>

      {/* Số tiền */}
      <label className="block text-sm font-medium text-muted mb-1.5">Số tiền</label>
      <div className="mb-4">
        <MoneyInput
          className="field text-2xl font-bold"
          suffixClassName="text-xl"
          placeholder="0"
          value={amountStr}
          onChange={setAmountStr}
        />
      </div>

      {/* Tên */}
      <label className="block text-sm font-medium text-muted mb-1.5">Tên giao dịch</label>
      <input
        className="field mb-4"
        placeholder="VD: Ăn trưa, Lương tháng 7…"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Ngày */}
      <label className="block text-sm font-medium text-muted mb-1.5">Ngày</label>
      <input type="date" className="field mb-4" value={date} onChange={(e) => setDate(e.target.value)} />

      {/* Ví */}
      <label className="block text-sm font-medium text-muted mb-1.5">Ví</label>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        {store.wallets.map((w) => (
          <button
            key={w.id}
            onClick={() => setWalletId(w.id)}
            className={`chip ${walletId === w.id ? 'chip-on' : 'chip-off'}`}
          >
            {w.icon} {w.name}
          </button>
        ))}
      </div>

      {/* Danh mục */}
      <label className="block text-sm font-medium text-muted mb-1.5">Danh mục</label>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cats.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`flex flex-col items-center gap-1 py-2.5 rounded-2xl transition-all ${
              categoryId === c.id ? 'bg-brand-100 ring-2 ring-brand-400' : 'bg-white'
            }`}
          >
            <span
              className="h-9 w-9 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: c.color + '22' }}
            >
              {c.icon}
            </span>
            <span className="text-[10px] text-center leading-tight text-muted">{c.name}</span>
          </button>
        ))}
      </div>

      {budgetWarn && (
        <div
          className={`rounded-2xl px-4 py-3 mb-3 text-sm font-medium ${
            budgetWarn.level === 'over' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'
          }`}
        >
          {budgetWarn.level === 'over' ? '🚫 ' : '⚠️ '}
          {budgetWarn.text}
        </div>
      )}
      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary" onClick={submit}>
        {isEdit ? 'Lưu thay đổi' : 'Lưu giao dịch'}
      </button>
      {isEdit && (
        <button className="w-full py-3 mt-1 text-pinkish-500 font-medium" onClick={remove}>
          Xoá giao dịch
        </button>
      )}
    </Sheet>
  )
}
