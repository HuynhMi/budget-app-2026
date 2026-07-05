import { useState } from 'react'
import { useStore } from '../state/store'
import { formatVND } from '../lib/money'
import { todayISO } from '../lib/dates'
import { uid } from '../lib/uid'
import type { Screen } from '../App'

const FROM_KEY = 'sweep-from-wallet'
const TO_KEY = 'sweep-to-wallet'

/** '2026-07' → 'tháng 7/2026' */
function monthLabel(month: string): string {
  const [y, m] = month.split('-')
  return `tháng ${Number(m)}/${y}`
}

/** Banner cuối tháng: gợi ý chuyển phần dư hạn mức vào ví tiết kiệm (tiền thật). */
export function SavingsSweepBanner({
  month,
  amount,
  onNavigate
}: {
  month: string
  amount: number
  onNavigate: (s: Screen) => void
}) {
  const store = useStore()
  const spendWallets = store.wallets.filter((w) => !w.excludeFromTotal)
  const savingWallets = store.wallets.filter((w) => w.excludeFromTotal)

  const [fromId, setFromId] = useState(
    () => localStorage.getItem(FROM_KEY) ?? spendWallets[0]?.id ?? ''
  )
  const [toId, setToId] = useState(() => localStorage.getItem(TO_KEY) ?? savingWallets[0]?.id ?? '')

  const skip = async () => {
    await store.recordSweep({ month, amount, status: 'skipped' })
  }

  const doSweep = async () => {
    const from = spendWallets.find((w) => w.id === fromId)?.id ?? spendWallets[0]?.id
    const to = savingWallets.find((w) => w.id === toId)?.id ?? savingWallets[0]?.id
    if (!from || !to) return
    localStorage.setItem(FROM_KEY, from)
    localStorage.setItem(TO_KEY, to)
    const transferId = uid()
    await store.saveTransfer({
      id: transferId,
      fromWalletId: from,
      toWalletId: to,
      amount,
      date: todayISO(),
      note: `Tiết kiệm ${monthLabel(month)}`
    })
    await store.recordSweep({ month, amount, fromWalletId: from, toWalletId: to, transferId, status: 'done' })
  }

  const noSavingWallet = savingWallets.length === 0

  return (
    <div className="card p-4 mt-5 border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-white">
      <div className="flex items-start gap-2">
        <span className="text-2xl">🐷</span>
        <div className="min-w-0">
          <div className="font-bold text-ink">
            {monthLabel(month).replace('tháng', 'Tháng')} bạn tiết kiệm được {formatVND(amount)}!
          </div>
          <div className="text-xs text-muted mt-0.5">Bỏ vào hũ tiết kiệm để tích luỹ dần nhé.</div>
        </div>
      </div>

      {noSavingWallet ? (
        <div className="mt-3">
          <p className="text-xs text-muted mb-2">
            Bạn chưa có ví tiết kiệm. Hãy tạo một ví và bật “không tính vào tiền chi tiêu”.
          </p>
          <div className="flex gap-2">
            <button className="btn-primary flex-1" onClick={() => onNavigate('wallets')}>
              Tạo ví tiết kiệm
            </button>
            <button className="px-4 py-3 text-muted font-medium" onClick={skip}>
              Để sau
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <label className="block">
              <span className="text-[11px] text-muted">Từ ví</span>
              <select
                className="field mt-1 text-sm py-2"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
              >
                {spendWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.icon} {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] text-muted">Vào hũ</span>
              <select
                className="field mt-1 text-sm py-2"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
              >
                {savingWallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.icon} {w.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn-primary flex-1" onClick={doSweep}>
              Bỏ {formatVND(amount)} vào hũ
            </button>
            <button className="px-4 py-3 text-muted font-medium" onClick={skip}>
              Bỏ qua
            </button>
          </div>
        </>
      )}
    </div>
  )
}
