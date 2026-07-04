import { groupDigits } from '../lib/money'

interface Props {
  /** Chuỗi số thô (chỉ chữ số), vd "2400000" */
  value: string
  /** Trả về chuỗi số thô đã lọc (chỉ chữ số) */
  onChange: (rawDigits: string) => void
  placeholder?: string
  className?: string
  suffixClassName?: string
  onEnter?: () => void
  autoFocus?: boolean
}

/**
 * Ô nhập tiền: tự thêm dấu chấm phân cách hàng nghìn khi gõ và hiện ký hiệu ₫
 * mờ ở cuối. Lưu ra ngoài dưới dạng chuỗi chữ số thô (parseVND vẫn đọc được).
 */
export function MoneyInput({
  value,
  onChange,
  placeholder,
  className = 'field',
  suffixClassName = 'text-base',
  onEnter,
  autoFocus
}: Props) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        autoFocus={autoFocus}
        className={`${className} pr-10`}
        placeholder={placeholder}
        value={groupDigits(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter()
        }}
      />
      <span
        className={`absolute right-4 top-1/2 -translate-y-1/2 text-muted/50 pointer-events-none select-none ${suffixClassName}`}
      >
        ₫
      </span>
    </div>
  )
}
