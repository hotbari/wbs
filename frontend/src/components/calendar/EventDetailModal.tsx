'use client'
import { Modal, Button } from '@/components/ui/primitives'
import { Trash, PencilSimple } from '@phosphor-icons/react'
import type { CalendarEventDTO } from '@/lib/api/calendar'

interface Props {
  event: CalendarEventDTO | null
  onClose: () => void
  onEdit: (e: CalendarEventDTO) => void
  onDelete: (e: CalendarEventDTO) => void
}

export function EventDetailModal({ event, onClose, onEdit, onDelete }: Props) {
  if (!event) return null
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('ko-KR', { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <Modal open={!!event} onClose={onClose} title={event.title}>
      <div className="px-5 py-4 space-y-3 text-sm">
        <div className="text-muted-foreground">
          {event.allDay ? '종일' : `${fmt(event.startAt)} – ${fmt(event.endAt)}`}
        </div>
        {event.location && <div>📍 {event.location}</div>}
        {event.description && <p className="whitespace-pre-wrap">{event.description}</p>}
        <div className="text-xs text-muted-foreground pt-2 border-t border-border">
          {event.isMine ? '내 일정' : `${event.ownerName} · ${event.isPublic ? '공개' : '비공개'}`}
        </div>
      </div>
      {event.isMine && (
        <div className="flex gap-2 px-5 py-3 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={() => onEdit(event)}>
            <PencilSimple className="h-4 w-4 mr-1" /> 수정
          </Button>
          <Button variant="destructive" onClick={() => onDelete(event)}>
            <Trash className="h-4 w-4 mr-1" /> 삭제
          </Button>
        </div>
      )}
    </Modal>
  )
}
