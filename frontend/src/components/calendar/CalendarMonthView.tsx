'use client'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { EventBlock } from './EventBlock'
import { monthGridDays, isSameDay, isSameMonth } from './calendar-utils'
import type { CalendarEventDTO } from '@/lib/api/calendar'

interface Props {
  anchor: Date
  events: CalendarEventDTO[]
  today: Date
  onCellClick: (d: Date) => void
  onEventClick: (e: CalendarEventDTO) => void
}

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']

export function CalendarMonthView({ anchor, events, today, onCellClick, onEventClick }: Props) {
  const days = useMemo(() => monthGridDays(anchor), [anchor])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventDTO[]>()
    for (const day of days) {
      const dayStart = new Date(day); dayStart.setHours(0, 0, 0, 0)
      const dayEnd   = new Date(day); dayEnd.setHours(24, 0, 0, 0)
      const matched = events.filter(ev => {
        const s = new Date(ev.startAt); const en = new Date(ev.endAt)
        return s < dayEnd && en > dayStart
      })
      map.set(day.toDateString(), matched)
    }
    return map
  }, [days, events])

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden border border-border">
      <div className="grid grid-cols-7 bg-muted/40 border-b border-border">
        {WEEKDAYS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'px-3 py-2 text-[11px] uppercase tracking-wider font-semibold',
              i >= 5 ? 'text-muted-foreground/60' : 'text-muted-foreground',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 bg-border gap-px">
        {days.map((d) => {
          const inMonth = isSameMonth(d, anchor)
          const isToday = isSameDay(d, today)
          const cellEvents = eventsByDay.get(d.toDateString()) ?? []
          return (
            <div
              key={d.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onCellClick(d)}
              onKeyDown={(e) => { if (e.key === 'Enter') onCellClick(d) }}
              className={cn(
                'relative flex flex-col gap-1 p-1.5 min-h-[100px] bg-card cursor-pointer',
                'hover:bg-muted/40 transition-colors',
                !inMonth && 'bg-muted/30',
                isToday && 'ring-1 ring-emerald-500/30',
              )}
              style={isToday ? { background: 'var(--calendar-today-tint), var(--card)' } : undefined}
            >
              <div className={cn(
                'flex items-center gap-1.5 text-[11px] font-mono tabular-nums',
                !inMonth ? 'text-muted-foreground/40' : 'text-muted-foreground',
                isToday && 'text-emerald-700 font-semibold',
              )}>
                {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                <span>{d.getDate()}</span>
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {cellEvents.slice(0, 3).map(ev => (
                  <EventBlock
                    key={ev.id + d.toDateString()}
                    event={ev}
                    showTime={!ev.allDay}
                    onClick={() => onEventClick(ev)}
                  />
                ))}
                {cellEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{cellEvents.length - 3}개
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
