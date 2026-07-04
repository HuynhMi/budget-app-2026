/**
 * Đọc số tiền từ ảnh bằng Tesseract.js (chạy trong trình duyệt).
 * Trả về giá đoán được (số nguyên VND) và text thô để người dùng đối chiếu.
 * Luôn cho phép người dùng sửa lại — OCR có thể sai.
 */
export async function extractPrice(
  file: File,
  onProgress?: (msg: string) => void
): Promise<{ price: number; raw: string }> {
  const Tesseract = (await import('tesseract.js')).default
  onProgress?.('Đang tải bộ nhận dạng…')
  const { data } = await Tesseract.recognize(file, 'eng', {
    logger: (m: { status?: string; progress?: number }) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        onProgress?.(`Đang đọc ảnh… ${Math.round(m.progress * 100)}%`)
      }
    }
  })
  const raw = (data.text || '').trim()
  return { price: pickPrice(raw), raw }
}

/**
 * Chọn giá hợp lý nhất từ text OCR.
 * Bắt các cụm số như "45.000", "45,000", "45000", "120.000đ".
 * Ưu tiên số lớn nhất (thường là tổng/giá chính) và loại số quá nhỏ (<1000 hiếm khi là giá).
 */
export function pickPrice(text: string): number {
  // Bắt cụm số liền nhau (có thể chứa . hoặc , nhưng KHÔNG chứa khoảng trắng/xuống dòng)
  const matches = text.match(/\d[\d.,]*\d|\d+/g) ?? []
  const candidates: number[] = []
  for (const m of matches) {
    const digits = m.replace(/[^\d]/g, '')
    if (!digits) continue
    const n = parseInt(digits, 10)
    if (n >= 1000 && n <= 100_000_000) candidates.push(n)
  }
  if (candidates.length === 0) {
    // thử số nhỏ hơn nếu không có ứng viên lớn
    const small = (text.match(/\d{3,}/g) ?? []).map((s) => parseInt(s, 10)).filter((n) => n > 0)
    return small.length ? Math.max(...small) : 0
  }
  return Math.max(...candidates)
}
