/** Trả về mảng mới với phần tử ở `from` được chuyển tới vị trí `to` */
export function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const copy = arr.slice()
  if (from < 0 || from >= copy.length) return copy
  const clampedTo = Math.max(0, Math.min(copy.length - 1, to))
  const [item] = copy.splice(from, 1)
  copy.splice(clampedTo, 0, item)
  return copy
}
