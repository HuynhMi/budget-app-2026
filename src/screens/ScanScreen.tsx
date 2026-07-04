import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { formatVND, parseVND } from '../lib/money'
import { uid } from '../lib/uid'
import { extractPrice } from '../lib/ocr'
import { AddTransactionSheet } from './AddTransactionSheet'

interface CartItem {
  id: string
  name: string
  price: number
}

export function ScanScreen({ onBack }: { onBack: () => void }) {
  const store = useStore()
  const [items, setItems] = useState<CartItem[]>([])
  const [name, setName] = useState('')
  const [priceStr, setPriceStr] = useState('')
  const [budgetStr, setBudgetStr] = useState('')
  const [ocrBusy, setOcrBusy] = useState(false)
  const [ocrMsg, setOcrMsg] = useState('')
  const [qrOpen, setQrOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const total = items.reduce((s, i) => s + i.price, 0)
  const budget = parseVND(budgetStr)
  const over = budget > 0 && total > budget
  const remaining = budget - total

  const addItem = () => {
    const price = parseVND(priceStr)
    if (price <= 0) return
    setItems((prev) => [...prev, { id: uid(), name: name.trim() || 'Món hàng', price }])
    setName('')
    setPriceStr('')
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const onPhoto = async (file: File) => {
    setOcrBusy(true)
    setOcrMsg('Đang đọc ảnh…')
    try {
      const { price, raw } = await extractPrice(file, (m) => setOcrMsg(m))
      if (price > 0) {
        setPriceStr(String(price))
        setOcrMsg(`Đọc được: ${formatVND(price)}. Kiểm tra lại rồi bấm Thêm.`)
      } else {
        setOcrMsg(raw ? `Không chắc giá. Text: "${raw.slice(0, 40)}". Nhập tay giúp nhé.` : 'Không đọc được số. Nhập tay giúp nhé.')
      }
    } catch (e) {
      setOcrMsg('Lỗi đọc ảnh. Nhập giá bằng tay nhé.')
    } finally {
      setOcrBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f2ff]">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand-400 to-pinkish-500 text-white px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-2xl" aria-label="Quay lại">‹</button>
          <div>
            <h1 className="text-xl font-extrabold">Quét giá · Giỏ hàng</h1>
            <p className="text-white/80 text-xs">Đi siêu thị: cộng dồn để không mua quá tiền</p>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur rounded-2xl p-4">
          <div className="text-white/80 text-sm">Tổng tạm tính</div>
          <div className={`text-3xl font-extrabold ${over ? 'text-yellow-200' : ''}`}>{formatVND(total)}</div>
          {budget > 0 && (
            <div className="mt-2">
              <div className="h-2 rounded-full bg-white/25 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${over ? 'bg-yellow-300' : 'bg-white'}`}
                  style={{ width: `${Math.min(100, budget ? (total / budget) * 100 : 0)}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-white/90">
                {over ? `⚠️ Vượt hạn mức ${formatVND(-remaining)}` : `Còn lại ${formatVND(remaining)} / ${formatVND(budget)}`}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-32 pt-4">
        {/* Hạn mức */}
        <label className="block text-sm font-medium text-muted mb-1.5">Hạn mức chi (tuỳ chọn)</label>
        <input
          inputMode="numeric"
          className="field mb-4"
          placeholder="VD: 500000"
          value={budgetStr}
          onChange={(e) => setBudgetStr(e.target.value)}
        />

        {/* Thêm món */}
        <div className="card p-4 mb-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={ocrBusy}
              className="btn-ghost flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              📷 Chụp giá
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="btn-ghost flex-1 flex items-center justify-center gap-1.5"
            >
              🔳 Quét QR
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onPhoto(f)
              e.target.value = ''
            }}
          />
          {ocrMsg && (
            <div className={`text-xs mb-3 ${ocrBusy ? 'text-brand-500 animate-pulse' : 'text-muted'}`}>{ocrMsg}</div>
          )}

          <div className="flex gap-2">
            <input
              className="field flex-1"
              placeholder="Tên món"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              inputMode="numeric"
              className="field w-28"
              placeholder="Giá"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
          </div>
          <button className="btn-primary mt-3" onClick={addItem}>
            ＋ Thêm vào giỏ
          </button>
        </div>

        {/* Danh sách giỏ */}
        <div className="card divide-y divide-brand-50">
          {items.length === 0 && (
            <div className="py-8 text-center text-muted text-sm px-4">
              Giỏ trống. Chụp giá hoặc nhập tay để bắt đầu cộng dồn.
            </div>
          )}
          {items.map((it, idx) => (
            <div key={it.id} className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="flex-1 font-medium truncate">{it.name}</div>
              <div className="font-bold text-brand-600">{formatVND(it.price)}</div>
              <button onClick={() => removeItem(it.id)} className="text-muted text-lg px-1" aria-label="Xoá">
                ×
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <button className="btn-primary mt-5" onClick={() => setAddOpen(true)}>
            ✅ Thêm vào chi tiêu hôm nay ({formatVND(total)})
          </button>
        )}
        <p className="text-xs text-muted text-center mt-3 px-4">
          Giỏ hàng chỉ là bảng tính tạm. Chỉ khi bấm nút trên, tổng mới được ghi thành 1 khoản chi.
        </p>
      </div>

      {qrOpen && (
        <QrScanner
          onClose={() => setQrOpen(false)}
          onResult={(text) => {
            setName(text)
            setQrOpen(false)
          }}
        />
      )}

      <AddTransactionSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        prefill={{ name: 'Đi siêu thị', amount: total, type: 'expense' }}
        onSaved={() => {
          setItems([])
          onBack()
        }}
      />
    </div>
  )
}

function QrScanner({ onClose, onResult }: { onClose: () => void; onResult: (text: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [err, setErr] = useState('')
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  useEffect(() => {
    let cancelled = false
    const start = async () => {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        const reader = new BrowserMultiFormatReader()
        const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (result) {
            controls.stop()
            onResult(result.getText())
          }
        })
        if (cancelled) controls.stop()
        else controlsRef.current = controls
      } catch (e) {
        setErr('Không mở được camera. Hãy cấp quyền camera hoặc nhập tay.')
      }
    }
    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="font-semibold">Quét mã QR / vạch</span>
        <button
          onClick={() => {
            controlsRef.current?.stop()
            onClose()
          }}
          className="text-2xl px-2"
        >
          ×
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center relative">
        <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 border-4 border-white/80 rounded-3xl" />
        </div>
      </div>
      {err && <div className="p-4 text-center text-yellow-200 text-sm">{err}</div>}
    </div>
  )
}
