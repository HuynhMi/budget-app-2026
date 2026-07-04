/** Định dạng số tiền theo VND, ví dụ 1500000 -> "1.500.000 ₫" */
export function formatVND(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)
  const grouped = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}${grouped} ₫`
}

/** Định dạng gọn: 1.500.000 -> "1,5tr", 12000 -> "12k" */
export function formatShort(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    const v = abs / 1_000_000
    return `${sign}${trim(v)}tr`
  }
  if (abs >= 1_000) {
    const v = abs / 1_000
    return `${sign}${trim(v)}k`
  }
  return `${sign}${abs}`
}

function trim(v: number): string {
  return (Math.round(v * 10) / 10).toString().replace('.', ',')
}

/** Nhóm hàng nghìn khi người dùng gõ: "2400000" -> "2.400.000". Bỏ ký tự không phải số. */
export function groupDigits(s: string): string {
  const digits = (s ?? '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Chuyển chuỗi người dùng nhập ("1.500.000", "1500000", "1,5tr") thành số nguyên VND */
export function parseVND(s: string): number {
  if (!s) return 0
  const raw = s.trim().toLowerCase()
  // Hỗ trợ hậu tố tr / k
  const suffixMatch = raw.match(/^([\d.,\s]+)\s*(tr|k)?$/)
  if (suffixMatch) {
    const numPart = suffixMatch[1].replace(/[.\s]/g, '').replace(',', '.')
    const num = parseFloat(numPart)
    if (!isNaN(num)) {
      if (suffixMatch[2] === 'tr') return Math.round(num * 1_000_000)
      if (suffixMatch[2] === 'k') return Math.round(num * 1_000)
      return Math.round(num)
    }
  }
  const digits = raw.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}
