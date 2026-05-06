// All date math is week-starts-Monday, Asia/Seoul (KST) — but we keep it timezone-naive
// because the page consumes ISO strings from the server already normalized.

export type CalendarView = 'month' | 'week'

export function startOfWeek(d: Date): Date {
  const r = new Date(d)
  const day = r.getDay() // 0 (Sun) .. 6 (Sat)
  const monIndex = (day + 6) % 7 // Mon=0
  r.setDate(r.getDate() - monIndex)
  r.setHours(0, 0, 0, 0)
  return r
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

/** First Monday on or before the 1st of `d`'s month — anchors the 6-row grid. */
export function monthGridStart(d: Date): Date {
  return startOfWeek(startOfMonth(d))
}

/** 42 days (6 rows × 7) starting at `monthGridStart`. */
export function monthGridDays(d: Date): Date[] {
  const start = monthGridStart(d)
  return Array.from({ length: 42 }, (_, i) => {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    return x
  })
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor)
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start)
    x.setDate(start.getDate() + i)
    return x
  })
}

export function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

export function addWeeks(d: Date, n: number): Date {
  const r = new Date(d)
  r.setDate(r.getDate() + 7 * n)
  return r
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate()
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function toDateOnlyISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function parseDateOnly(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Range to query the API for: a 6-row month grid + small padding. */
export function monthQueryRange(anchor: Date): { from: string; to: string } {
  const days = monthGridDays(anchor)
  const fromD = days[0]
  const toD = new Date(days[41])
  toD.setDate(toD.getDate() + 1)
  return { from: fromD.toISOString(), to: toD.toISOString() }
}

export function weekQueryRange(anchor: Date): { from: string; to: string } {
  const days = weekDays(anchor)
  const fromD = days[0]
  const toD = new Date(days[6])
  toD.setDate(toD.getDate() + 1)
  return { from: fromD.toISOString(), to: toD.toISOString() }
}
