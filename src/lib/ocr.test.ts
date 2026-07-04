import { describe, it, expect } from 'vitest'
import { pickPrice } from './ocr'

describe('pickPrice', () => {
  it('đọc giá có dấu chấm nghìn', () => {
    expect(pickPrice('Sữa tươi\n45.000 đ')).toBe(45000)
  })
  it('chọn số lớn nhất (tổng)', () => {
    expect(pickPrice('20.000\n15.000\nTong: 35.000')).toBe(35000)
  })
  it('bỏ số quá nhỏ như mã vạch ngắn', () => {
    expect(pickPrice('SKU 12\n99.000 vnd')).toBe(99000)
  })
  it('không có giá trả 0', () => {
    expect(pickPrice('khong co so gi ca')).toBe(0)
  })
})
