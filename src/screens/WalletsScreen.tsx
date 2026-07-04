import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { walletBalance, totalBalance } from '../lib/balance'
import { formatVND, parseVND } from '../lib/money'
import { todayISO } from '../lib/dates'
import { Sheet } from '../components/Sheet'
import { IconPicker, ColorPicker, WALLET_ICONS } from '../components/Pickers'
import { exportJSON, importJSON, resetAll } from '../db'
import type { Wallet } from '../types'
import type { Screen } from '../App'

export function WalletsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const store = useStore()
  const [editing, setEditing] = useState<Wallet | 'new' | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
  const total = totalBalance(store.wallets, store.transactions, store.transfers)

  return (
    <div className="screen-pad pt-12">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-extrabold">Ví của tôi</h1>
        <button onClick={() => onNavigate('categories')} className="btn-ghost text-sm py-2">
          🏷️ Danh mục
        </button>
      </div>
      <div className="text-muted text-sm mb-4">Tổng số dư: <b className="text-ink">{formatVND(total)}</b></div>

      <div className="grid gap-3">
        {store.wallets.map((w) => (
          <button
            key={w.id}
            onClick={() => setEditing(w)}
            className="rounded-3xl p-4 text-white shadow-soft text-left active:scale-[0.99] transition-transform"
            style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color}bb)` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl">{w.icon}</div>
              <div className="text-xs opacity-80">Sửa ›</div>
            </div>
            <div className="mt-3 opacity-90">{w.name}</div>
            <div className="text-2xl font-extrabold">
              {formatVND(walletBalance(w, store.transactions, store.transfers))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-4">
        <button onClick={() => setEditing('new')} className="btn-ghost flex-1">
          ＋ Thêm ví
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="btn-ghost flex-1"
          disabled={store.wallets.length < 2}
        >
          🔄 Chuyển tiền
        </button>
      </div>

      <BackupSection />

      {editing && (
        <WalletEditor
          wallet={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {transferOpen && <TransferSheet onClose={() => setTransferOpen(false)} />}
    </div>
  )
}

function BackupSection() {
  const store = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')

  const doExport = async () => {
    const json = await exportJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sao-luu-chi-tieu-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Đã tải file sao lưu.')
  }

  const doImport = async (file: File) => {
    if (!confirm('Nhập dữ liệu sẽ GHI ĐÈ toàn bộ dữ liệu hiện tại. Tiếp tục?')) return
    try {
      const text = await file.text()
      await importJSON(text)
      await store.reload()
      setMsg('Đã nhập dữ liệu thành công.')
    } catch {
      setMsg('File không hợp lệ.')
    }
  }

  return (
    <div className="card p-4 mt-5">
      <h2 className="font-bold mb-1">Sao lưu dữ liệu</h2>
      <p className="text-xs text-muted mb-3">Dữ liệu lưu trên máy này. Xuất file để backup hoặc chuyển sang máy khác.</p>
      <div className="flex gap-2">
        <button onClick={doExport} className="btn-ghost flex-1">⬇️ Xuất file</button>
        <button onClick={() => fileRef.current?.click()} className="btn-ghost flex-1">⬆️ Nhập file</button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) doImport(f)
          e.target.value = ''
        }}
      />
      <button
        onClick={async () => {
          if (!confirm('Xoá TOÀN BỘ dữ liệu (ví, giao dịch, danh mục, ngân sách) và tạo lại mặc định? Không thể hoàn tác.')) return
          await resetAll()
          await store.reload()
          setMsg('Đã đặt lại dữ liệu về mặc định.')
        }}
        className="w-full mt-2 py-2.5 text-sm text-pinkish-500 font-medium"
      >
        🗑️ Đặt lại dữ liệu về mặc định
      </button>
      {msg && <div className="text-xs text-brand-500 mt-2">{msg}</div>}
    </div>
  )
}

function WalletEditor({ wallet, onClose }: { wallet: Wallet | null; onClose: () => void }) {
  const store = useStore()
  const [name, setName] = useState(wallet?.name ?? '')
  const [icon, setIcon] = useState(wallet?.icon ?? WALLET_ICONS[0])
  const [color, setColor] = useState(wallet?.color ?? '#a855f7')
  const [balanceStr, setBalanceStr] = useState(wallet ? String(wallet.initialBalance) : '')
  const [error, setError] = useState('')

  const save = async () => {
    if (!name.trim()) return setError('Nhập tên ví')
    await store.saveWallet({
      id: wallet?.id,
      name: name.trim(),
      icon,
      color,
      initialBalance: parseVND(balanceStr)
    })
    onClose()
  }

  const remove = async () => {
    if (!wallet) return
    const used = store.transactions.some((t) => t.walletId === wallet.id) ||
      store.transfers.some((t) => t.fromWalletId === wallet.id || t.toWalletId === wallet.id)
    if (used && !confirm('Ví này có giao dịch. Xoá ví sẽ không xoá giao dịch cũ. Vẫn xoá?')) return
    await store.removeWallet(wallet.id)
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title={wallet ? 'Sửa ví' : 'Thêm ví'}>
      <label className="block text-sm font-medium text-muted mb-1.5">Tên ví</label>
      <input className="field mb-4" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Ví tiền mặt" />

      <label className="block text-sm font-medium text-muted mb-1.5">
        {wallet ? 'Số dư ban đầu' : 'Số dư hiện có'}
      </label>
      <input inputMode="numeric" className="field mb-4" value={balanceStr} onChange={(e) => setBalanceStr(e.target.value)} placeholder="0" />

      <label className="block text-sm font-medium text-muted mb-2">Biểu tượng</label>
      <div className="mb-4"><IconPicker icons={WALLET_ICONS} value={icon} onChange={setIcon} /></div>

      <label className="block text-sm font-medium text-muted mb-2">Màu</label>
      <div className="mb-5"><ColorPicker value={color} onChange={setColor} /></div>

      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary mb-2" onClick={save}>Lưu</button>
      {wallet && (
        <button className="w-full py-3 text-pinkish-500 font-medium" onClick={remove}>
          Xoá ví
        </button>
      )}
    </Sheet>
  )
}

function TransferSheet({ onClose }: { onClose: () => void }) {
  const store = useStore()
  const [from, setFrom] = useState(store.wallets[0]?.id ?? '')
  const [to, setTo] = useState(store.wallets[1]?.id ?? '')
  const [amountStr, setAmountStr] = useState('')
  const [error, setError] = useState('')

  const save = async () => {
    const amount = parseVND(amountStr)
    if (from === to) return setError('Chọn hai ví khác nhau')
    if (amount <= 0) return setError('Nhập số tiền hợp lệ')
    await store.saveTransfer({ fromWalletId: from, toWalletId: to, amount, date: todayISO() })
    onClose()
  }

  return (
    <Sheet open onClose={onClose} title="Chuyển tiền giữa ví">
      <label className="block text-sm font-medium text-muted mb-1.5">Từ ví</label>
      <select className="field mb-4" value={from} onChange={(e) => setFrom(e.target.value)}>
        {store.wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
        ))}
      </select>

      <div className="text-center text-2xl text-brand-400 mb-2">↓</div>

      <label className="block text-sm font-medium text-muted mb-1.5">Đến ví</label>
      <select className="field mb-4" value={to} onChange={(e) => setTo(e.target.value)}>
        {store.wallets.map((w) => (
          <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
        ))}
      </select>

      <label className="block text-sm font-medium text-muted mb-1.5">Số tiền</label>
      <input inputMode="numeric" className="field mb-4 text-xl font-bold" value={amountStr} onChange={(e) => setAmountStr(e.target.value)} placeholder="0" />

      {error && <div className="text-pinkish-500 text-sm mb-3 text-center">{error}</div>}
      <button className="btn-primary" onClick={save}>Chuyển</button>
    </Sheet>
  )
}
