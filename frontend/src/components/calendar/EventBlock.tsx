'use client'
import { Lock, Globe } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { CalendarEventDTO } from '@/lib/api/calendar'

type Variant = 'private-mine' | 'public-mine' | 'public-other'

export function eventVariant(ev: CalendarEventDTO): Variant {
  if (!ev.isMine) return 'public-other'
  return ev.isPublic ? 'public-mine' : 'private-mine'
}

interface Props {
  event: CalendarEventDTO
  onClick?: (e: React.MouseEvent) => void
  showTime?: boolean
  className?: string
}

export function EventBlock({ event, onClick, showTime = true, className }: Props) {
  const variant = eventVariant(event)
  const styleByVariant: Record<Variant, React.CSSProperties> = {
    'private-mine': {
      background: 'var(--event-private-bg)',
      borderLeftColor: 'var(--event-private-border)',
    },
    'public-mine': {
      background: 'var(--event-public-mine-bg)',
      borderLeftColor: 'var(--event-public-mine-border)',
    },
    'public-other': {
      background: 'var(--event-public-other-bg)',
      borderLeftColor: 'var(--event-public-other-border)',
    },
  }
  const time = showTime && !event.allDay
    ? new Date(event.startAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    : null

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(e) }}
      style={styleByVariant[variant]}
      className={cn(
        'w-full text-left flex items-center gap-1.5 px-1.5 py-0.5 rounded',
        'border-l-[3px] text-[11px] leading-tight',
        'truncate hover:-translate-y-px transition-transform duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        className,
      )}
    >
      {variant === 'private-mine' && <Lock className="h-3 w-3 shrink-0 opacity-70" weight="duotone" />}
      {variant === 'public-mine'  && <Globe className="h-3 w-3 shrink-0 opacity-70" weight="duotone" />}
      {variant === 'public-other' && (
        <span className="shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-zinc-200 text-zinc-600 text-[9px] font-semibold">
          {event.ownerInitial}
        </span>
      )}
      {time && <span className="font-mono tabular-nums text-muted-foreground text-[10px]">{time}</span>}
      <span className="truncate">{event.title}</span>
    </button>
  )
}
