import { useEffect, useMemo, useState } from 'react'
import { Sheet } from '../components/Sheet'
import { useStore } from '../state/store'
import { parseVND, formatVND } from '../lib/money'
import { todayISO } from '../lib/dates'
import type { TxType } from '../types'

interface Props {
  open: boolean
  onClose: () => void
  /** Giá trị điền sẵn (vd từ màn hình quét) */
  prefill?: { name?: string; amount?: number; type?: TxType }
  onSaved?: () => void
}

export function AddTransactionSheet({ open, onClose, prefill, onSaved }: Props) {
  const store = useStore()
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
      setType(prefill?.type ?? 'expense')
      setName(prefill?.name ?? '')
      setAmountStr(prefill?.amount ? String(prefill.amount) : '')
      setDate(todayISO())
      setWalletId(store.wallets[0]?.id ?? '')
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

  const submit = async () => {
    if (amount <= 0) return setError('Nhập số tiền hợp lệ')
    if (!walletId) return setError('Chọn ví')
    if (!categoryId) return setError('Chọn danh mục')
    await store.saveTransaction({
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

  return (
    <Sheet open={open} onClose={onClose} title="Thêm giao dịch">
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
      <input
        inputMode="numeric"
        className="field text-2xl font-bold mb-1"
        placeholder="0"
        value={amountStr}
        onChange={(e) => setAmountStr(e.target.value)}
      />
      <div className="text-right text-sm text-brand-500 font-medium mb-4 h-5">
        {amount > 0 ? formatVND(amount) : ''}
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

      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary" onClick={submit}>
        Lưu giao dịch
      </button>
    </Sheet>
  )
}
