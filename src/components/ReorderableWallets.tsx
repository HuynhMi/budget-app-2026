import { useEffect, useRef, useState } from 'react'
import type { Wallet } from '../types'
import { formatVND } from '../lib/money'
import { arrayMove } from '../lib/arrayMove'

interface Props {
  wallets: Wallet[]
  balanceOf: (w: Wallet) => number
  onEdit: (w: Wallet) => void
  onReorder: (orderedIds: string[]) => void
}

/**
 * Danh sách ví dọc, kéo (bằng tay cầm ⠿) để sắp xếp lại. Dùng pointer events
 * nên chạy cả trên cảm ứng. Chỉ thẻ đang kéo di chuyển theo ngón tay; vị trí
 * sẽ thả được đánh dấu bằng 1 đường kẻ.
 */
export function ReorderableWallets({ wallets, balanceOf, onEdit, onReorder }: Props) {
  const [items, setItems] = useState<Wallet[]>(wallets)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const [dragDy, setDragDy] = useState(0)

  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const startY = useRef(0)

  // Đồng bộ từ props khi KHÔNG kéo (tránh nhảy khi đang kéo)
  useEffect(() => {
    if (dragIndex === null) setItems(wallets)
  }, [wallets, dragIndex])

  const onPointerDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    startY.current = e.clientY
    setDragIndex(index)
    setTargetIndex(index)
    setDragDy(0)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return
    const dy = e.clientY - startY.current
    setDragDy(dy)
    // Tính vị trí thả: so con trỏ với trung điểm từng hàng
    let idx = items.length - 1
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (e.clientY < r.top + r.height / 2) {
        idx = i
        break
      }
    }
    setTargetIndex(idx)
  }

  const onPointerUp = () => {
    if (dragIndex !== null && targetIndex !== null && dragIndex !== targetIndex) {
      const next = arrayMove(items, dragIndex, targetIndex)
      setItems(next)
      onReorder(next.map((w) => w.id))
    }
    setDragIndex(null)
    setTargetIndex(null)
    setDragDy(0)
  }

  return (
    <div className="grid gap-3">
      {items.map((w, i) => {
        const dragging = dragIndex === i
        const showLineBefore = dragIndex !== null && targetIndex === i && targetIndex !== dragIndex
        return (
          <div key={w.id} ref={(el) => (rowRefs.current[i] = el)} className="relative">
            {showLineBefore && <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-brand-500" />}
            <div
              className={`rounded-3xl p-4 text-white shadow-soft flex items-stretch gap-2 transition-transform ${
                dragging ? 'z-20 scale-[1.03] shadow-2xl' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${w.color}, ${w.color}bb)`,
                transform: dragging ? `translateY(${dragDy}px)` : undefined,
                opacity: dragging ? 0.95 : 1
              }}
            >
              <button onClick={() => onEdit(w)} className="flex-1 text-left active:opacity-80">
                <div className="flex items-center justify-between">
                  <div className="text-2xl">{w.icon}</div>
                  {w.excludeFromTotal ? (
                    <div className="text-[10px] bg-white/25 rounded-full px-2 py-0.5">🔒 Tiết kiệm</div>
                  ) : (
                    <div className="text-xs opacity-80">Sửa ›</div>
                  )}
                </div>
                <div className="mt-3 opacity-90">{w.name}</div>
                <div className="text-2xl font-extrabold">{formatVND(balanceOf(w))}</div>
              </button>
              {/* Tay cầm kéo */}
              <div
                onPointerDown={(e) => onPointerDown(e, i)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="flex items-center px-1 cursor-grab active:cursor-grabbing touch-none select-none"
                aria-label="Kéo để sắp xếp"
                role="button"
              >
                <span className="text-white/70 text-2xl leading-none">⠿</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
