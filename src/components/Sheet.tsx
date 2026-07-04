import { type ReactNode, useEffect } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/** Bottom sheet dạng modal trượt lên từ đáy */
export function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[430px] bg-[#f6f2ff] rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-[slideup_0.22s_ease-out]">
        <div className="sticky top-0 bg-[#f6f2ff] px-5 pt-3 pb-2 z-10">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-brand-200 mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} className="text-muted text-2xl leading-none px-2" aria-label="Đóng">
              ×
            </button>
          </div>
        </div>
        <div className="px-5 pb-8 pt-2">{children}</div>
      </div>
      <style>{`@keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
