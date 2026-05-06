'use client'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { weekDays, isSameDay } from './calendar-utils'
import { EventBlock } from './EventBlock'
import type { CalendarEventDTO } from '@/lib/api/calendar'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 07:00 ~ 19:00
const HOUR_HEIGHT = 44 // px

interface Props {
  anchor: Date
  events: CalendarEventDTO[]
  today: Date
  onSlotClick: (d: Date) => void
  onEventClick: (e: CalendarEventDTO) => void
}

export function CalendarWeekView({ anchor, events, today, onSlotClick, onEventClick }: Props) {
  const days = useMemo(() => weekDays(anchor), [anchor])

  function eventStyle(ev: CalendarEventDTO, day: Date) {
    if (ev.allDay) return null
    const s = new Date(ev.startAt); const e = new Date(ev.endAt)
    const dayStart = new Date(day); dayStart.setHours(HOURS[0], 0, 0, 0)
    const top = Math.max(0, (s.getTime() - dayStart.getTime()) / 36e5) * HOUR_HEIGHT
    const dur = Math.max(0.25, (e.getTime() - s.getTime()) / 36e5)
    const height = Math.max(20, dur * HOUR_HEIGHT)
    return { top, height }
  }

  function eventsForDay(day: Date) {
    return events.filter(ev => {
      const s = new Date(ev.startAt); const e = new Date(ev.endAt)
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
      const dayEnd   = new Date(day); dayEnd.setHours(24, 0, 0, 0)
      return s < dayEnd && e > dayStart
    })
  }

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-border bg-card">
      {/* day header */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] bg-muted/40 border-b border-border">
        <div />
        {days.map((d) => {
          const isToday = isSameDay(d, today)
          return (
            <div
              key={d.toISOString()}
              className={cn(
                'px-3 py-2 text-xs',
                isToday ? 'text-emerald-700 font-semibold' : 'text-muted-foreground',
              )}
            >
              <span className="font-mono tabular-nums">{d.getDate()}</span>
              <span className="ml-1.5">{['월','화','수','목','금','토','일'][(d.getDay()+6)%7]}</span>
            </div>
          )
        })}
      </div>

      {/* timeline body */}
      <div className="relative grid grid-cols-[48px_repeat(7,1fr)]">
        {/* hours column */}
        <div className="flex flex-col">
          {HOURS.map(h => (
            <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[10px] text-muted-foreground/70 font-mono tabular-nums px-2 pt-1 border-t border-border first:border-t-0">
              {String(h).padStart(2,'0')}:00
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day.toISOString()} className="relative border-l border-border">
            {HOURS.map(h => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-t border-border first:border-t-0 hover:bg-muted/30 cursor-pointer"
                onClick={() => {
                  const slot = new Date(day)
                  slot.setHours(h, 0, 0, 0)
                  onSlotClick(slot)
                }}
              />
            ))}
            {/* events overlay */}
            {eventsForDay(day).map(ev => {
              const pos = eventStyle(ev, day)
              if (!pos) {
                return (
                  <div
                    key={ev.id + day.toDateString()}
                    className="absolute left-1 right-1 top-0.5 z-[1]"
                  >
                    <EventBlock event={ev} showTime={false} onClick={() => onEventClick(ev)} />
                  </div>
                )
              }
              return (
                <div
                  key={ev.id + day.toDateString()}
                  className="absolute left-1 right-1 z-[1]"
                  style={{ top: pos.top, height: pos.height }}
                >
                  <EventBlock event={ev} onClick={() => onEventClick(ev)} className="h-full items-start" />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
