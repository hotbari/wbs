'use client'
import { CaretLeft, CaretRight, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { CalendarFilter } from '@/lib/api/calendar'
import type { CalendarView } from './calendar-utils'

interface Props {
  view: CalendarView
  onViewChange: (v: CalendarView) => void
  anchor: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  filter: CalendarFilter
  onFilterChange: (f: CalendarFilter) => void
  onCreate: () => void
}

const FILTERS: { key: CalendarFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'MINE', label: '내 일정' },
  { key: 'PUBLIC', label: '공개만' },
]

export function CalendarHeader({
  view, onViewChange, anchor, onPrev, onNext, onToday, filter, onFilterChange, onCreate,
}: Props) {
  const label = view === 'month'
    ? `${anchor.getFullYear()}년 ${anchor.getMonth() + 1}월`
    : (() => {
        const start = new Date(anchor)
        const end = new Date(anchor); end.setDate(start.getDate() + 6)
        return `${start.getMonth() + 1}월 ${start.getDate()}일 – ${end.getMonth() + 1}월 ${end.getDate()}일`
      })()

  return (
    <div className="flex items-center justify-between mb-4 px-4 py-3 bg-card border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2">
        <button onClick={onPrev} aria-label="Previous" className="w-7 h-7 grid place-items-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <CaretLeft className="h-3.5 w-3.5" />
        </button>
        <button onClick={onNext} aria-label="Next" className="w-7 h-7 grid place-items-center border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          <CaretRight className="h-3.5 w-3.5" />
        </button>
        <span className="font-semibold text-base font-mono tabular-nums tracking-tight ml-1">{label}</span>
        <button onClick={onToday} className="ml-1 px-2.5 py-1 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40">
          오늘
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="inline-flex bg-muted/60 rounded-full p-0.5 gap-0.5">
          {(['month', 'week'] as CalendarView[]).map(v => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1 rounded-full text-xs',
                view === v ? 'bg-card shadow-[var(--shadow-sm)] text-foreground' : 'text-muted-foreground',
              )}
            >
              {v === 'month' ? '월간' : '주간'}
            </button>
          ))}
        </div>

        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={cn(
              'px-3 py-1 rounded-full text-xs border transition-colors',
              filter === f.key
                ? 'bg-zinc-900 text-zinc-50 border-zinc-900'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}

        <Button onClick={onCreate} className="ml-1.5">
          <Plus className="h-4 w-4 mr-1" /> 일정
        </Button>
      </div>
    </div>
  )
}
