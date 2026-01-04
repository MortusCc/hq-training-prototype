export function todayIso(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = `${d.getMonth() + 1}`.padStart(2, '0')
  const dd = `${d.getDate()}`.padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function isBefore(a: string, b: string): boolean {
  return a.localeCompare(b) < 0
}

export function isAfter(a: string, b: string): boolean {
  return a.localeCompare(b) > 0
}

