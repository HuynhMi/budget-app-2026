import { describe, it, expect } from 'vitest'
import { formatVND, formatShort, parseVND, groupDigits } from './money'

describe('formatVND', () => {
  it('nhóm hàng nghìn và thêm ký hiệu', () => {
    expect(formatVND(1500000)).toBe('1.500.000 ₫')
    expect(formatVND(0)).toBe('0 ₫')
    expect(formatVND(999)).toBe('999 ₫')
  })
  it('xử lý số âm', () => {
    expect(formatVND(-25000)).toBe('-25.000 ₫')
  })
})

describe('formatShort', () => {
  it('rút gọn triệu và nghìn', () => {
    expect(formatShort(1500000)).toBe('1,5tr')
    expect(formatShort(12000)).toBe('12k')
    expect(formatShort(500)).toBe('500')
    expect(formatShort(2000000)).toBe('2tr')
  })
})

describe('groupDigits', () => {
  it('thêm dấu chấm mỗi 3 số', () => {
    expect(groupDigits('2400000')).toBe('2.400.000')
    expect(groupDigits('500')).toBe('500')
    expect(groupDigits('1000')).toBe('1.000')
  })
  it('bỏ ký tự không phải số và chuỗi rỗng', () => {
    expect(groupDigits('2.400.000')).toBe('2.400.000')
    expect(groupDigits('abc12x3')).toBe('123')
    expect(groupDigits('')).toBe('')
  })
})

describe('parseVND', () => {
  it('bỏ dấu phân tách', () => {
    expect(parseVND('1.500.000')).toBe(1500000)
    expect(parseVND('1500000')).toBe(1500000)
  })
  it('hiểu hậu tố tr và k', () => {
    expect(parseVND('1,5tr')).toBe(1500000)
    expect(parseVND('12k')).toBe(12000)
    expect(parseVND('2 tr')).toBe(2000000)
  })
  it('chuỗi rỗng trả 0', () => {
    expect(parseVND('')).toBe(0)
    expect(parseVND('abc')).toBe(0)
  })
})
