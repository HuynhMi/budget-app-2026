import { describe, it, expect } from 'vitest'
import { arrayMove } from './arrayMove'

describe('arrayMove', () => {
  it('chuyển xuống dưới', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })
  it('chuyển lên trên', () => {
    expect(arrayMove(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })
  it('không đổi khi from === to', () => {
    expect(arrayMove(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c'])
  })
  it('kẹp to trong biên', () => {
    expect(arrayMove(['a', 'b', 'c'], 0, 99)).toEqual(['b', 'c', 'a'])
  })
  it('không mutate mảng gốc', () => {
    const src = ['a', 'b', 'c']
    arrayMove(src, 0, 2)
    expect(src).toEqual(['a', 'b', 'c'])
  })
})
