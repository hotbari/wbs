import { Suspense } from 'react'
import CalendarPageClient from './CalendarPageClient'

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="max-w-[1400px] mx-auto px-6 py-6 text-muted-foreground text-sm">로딩…</div>}>
      <CalendarPageClient />
    </Suspense>
  )
}
