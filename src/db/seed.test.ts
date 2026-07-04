import { describe, it, expect } from 'vitest'
import { defaultWallets, defaultCategories } from './seed'

describe('seed mặc định phải idempotent (chống nhân đôi khi seed 2 lần)', () => {
  it('ID ví ổn định giữa 2 lần gọi', () => {
    const a = defaultWallets().map((w) => w.id)
    const b = defaultWallets().map((w) => w.id)
    expect(a).toEqual(b)
  })
  it('ID danh mục ổn định giữa 2 lần gọi', () => {
    const a = defaultCategories().map((c) => c.id)
    const b = defaultCategories().map((c) => c.id)
    expect(a).toEqual(b)
  })
  it('không có ID trùng trong danh mục mặc định', () => {
    const ids = defaultCategories().map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('gộp 2 lần seed theo ID chỉ còn số bản ghi gốc (idempotent)', () => {
    const merge = <T extends { id: string }>(items: T[]) => {
      const m = new Map<string, T>()
      for (const it of items) m.set(it.id, it)
      return m
    }
    const twiceW = [...defaultWallets(), ...defaultWallets()]
    expect(merge(twiceW).size).toBe(defaultWallets().length)
    const twiceC = [...defaultCategories(), ...defaultCategories()]
    expect(merge(twiceC).size).toBe(defaultCategories().length)
  })
})
