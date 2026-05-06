'use client'
import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView'
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView'
import { EventDetailModal } from '@/components/calendar/EventDetailModal'
import { EventFormModal } from '@/components/calendar/EventFormModal'
import {
  addMonths, addWeeks, monthQueryRange, weekQueryRange,
  parseDateOnly, toDateOnlyISO, type CalendarView,
} from '@/components/calendar/calendar-utils'
import {
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from '@/components/calendar/useCalendarEvents'
import type { CalendarEventDTO, CalendarFilter } from '@/lib/api/calendar'

export default function CalendarPageClient() {
  const router = useRouter()
  const params = useSearchParams()

  const view: CalendarView = (params.get('view') === 'week' ? 'week' : 'month')
  const dateParam = params.get('date')
  const filter: CalendarFilter = (() => {
    const f = params.get('filter')?.toUpperCase()
    return f === 'MINE' || f === 'PUBLIC' ? f : 'ALL'
  })()
  const anchor = useMemo(() => dateParam ? parseDateOnly(dateParam) : new Date(), [dateParam])
  const today = useMemo(() => new Date(), [])

  const range = useMemo(
    () => view === 'month' ? monthQueryRange(anchor) : weekQueryRange(anchor),
    [view, anchor],
  )
  const queryKey = useMemo(
    () => ['calendar', range.from, range.to, filter] as const,
    [range, filter],
  )

  const { data: events = [] } = useCalendarEvents(range.from, range.to, filter)
  const createMut = useCreateCalendarEvent(queryKey)
  const updateMut = useUpdateCalendarEvent(queryKey)
  const deleteMut = useDeleteCalendarEvent(queryKey)

  const [detailEvent, setDetailEvent] = useState<CalendarEventDTO | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formInitial, setFormInitial] = useState<CalendarEventDTO | null>(null)
  const [formStart, setFormStart] = useState<Date | undefined>(undefined)
  const [formEnd, setFormEnd] = useState<Date | undefined>(undefined)

  const setUrl = useCallback((next: Partial<{ view: CalendarView; date: string; filter: CalendarFilter }>) => {
    const sp = new URLSearchParams(params.toString())
    if (next.view) sp.set('view', next.view)
    if (next.date) sp.set('date', next.date)
    if (next.filter) sp.set('filter', next.filter)
    router.replace(`/calendar?${sp.toString()}`)
  }, [params, router])

  const handlePrev  = () => setUrl({ date: toDateOnlyISO(view === 'month' ? addMonths(anchor, -1) : addWeeks(anchor, -1)) })
  const handleNext  = () => setUrl({ date: toDateOnlyISO(view === 'month' ? addMonths(anchor, 1)  : addWeeks(anchor, 1))  })
  const handleToday = () => setUrl({ date: toDateOnlyISO(new Date()) })

  function openCreateAtDay(_d: Date) {
    // Cell click in month view → all-day default (form picks all-day when start/end undefined)
    setFormInitial(null)
    setFormStart(undefined)
    setFormEnd(undefined)
    setFormOpen(true)
  }
  function openCreateAtSlot(d: Date) {
    setFormInitial(null)
    const e = new Date(d); e.setHours(d.getHours() + 1)
    setFormStart(d); setFormEnd(e)
    setFormOpen(true)
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <CalendarHeader
        view={view}
        onViewChange={(v) => setUrl({ view: v })}
        anchor={anchor}
        onPrev={handlePrev} onNext={handleNext} onToday={handleToday}
        filter={filter}
        onFilterChange={(f) => setUrl({ filter: f })}
        onCreate={() => { setFormInitial(null); setFormStart(undefined); setFormEnd(undefined); setFormOpen(true) }}
      />

      {view === 'month' ? (
        <CalendarMonthView
          anchor={anchor}
          events={events}
          today={today}
          onCellClick={openCreateAtDay}
          onEventClick={setDetailEvent}
        />
      ) : (
        <CalendarWeekView
          anchor={anchor}
          events={events}
          today={today}
          onSlotClick={openCreateAtSlot}
          onEventClick={setDetailEvent}
        />
      )}

      <EventDetailModal
        event={detailEvent}
        onClose={() => setDetailEvent(null)}
        onEdit={(ev) => { setDetailEvent(null); setFormInitial(ev); setFormOpen(true) }}
        onDelete={async (ev) => {
          if (!confirm('이 일정을 삭제할까요?')) return
          await deleteMut.mutateAsync(ev.id)
          setDetailEvent(null)
        }}
      />

      <EventFormModal
        open={formOpen}
        initial={formInitial}
        defaultStart={formStart}
        defaultEnd={formEnd}
        onClose={() => setFormOpen(false)}
        onSubmit={async (input, id) => {
          if (id) await updateMut.mutateAsync({ id, input })
          else    await createMut.mutateAsync(input)
        }}
      />
    </div>
  )
}
