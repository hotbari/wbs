'use client'
import { useEffect, useState } from 'react'
import { Modal, Button, Input, Textarea } from '@/components/ui/primitives'
import type { CalendarEventDTO, CalendarEventInput } from '@/lib/api/calendar'

interface Props {
  open: boolean
  initial?: CalendarEventDTO | null      // null = create, present = edit
  defaultStart?: Date                    // for create flow from cell click
  defaultEnd?: Date
  onClose: () => void
  onSubmit: (input: CalendarEventInput, id?: string) => Promise<void>
}

function toLocalInput(d: Date, allDay: boolean): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  if (allDay) return `${y}-${m}-${dd}`
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${dd}T${hh}:${mi}`
}

function fromLocalInput(s: string, allDay: boolean): Date {
  return allDay ? new Date(`${s}T00:00:00`) : new Date(s)
}

export function EventFormModal({ open, initial, defaultStart, defaultEnd, onClose, onSubmit }: Props) {
  const [allDay, setAllDay] = useState(false)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setAllDay(initial.allDay)
      setTitle(initial.title)
      setStart(toLocalInput(new Date(initial.startAt), initial.allDay))
      setEnd(toLocalInput(new Date(initial.endAt), initial.allDay))
      setLocation(initial.location ?? '')
      setDescription(initial.description ?? '')
      setIsPublic(initial.isPublic)
    } else {
      const s = defaultStart ?? new Date()
      const e = defaultEnd ?? new Date(s.getTime() + 60 * 60 * 1000)
      const isAll = !defaultStart && !defaultEnd
      setAllDay(isAll)
      setTitle('')
      setStart(toLocalInput(s, isAll))
      setEnd(toLocalInput(e, isAll))
      setLocation('')
      setDescription('')
      setIsPublic(false)
    }
    setError(null)
  }, [open, initial, defaultStart, defaultEnd])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!title.trim()) { setError('제목을 입력해 주세요'); return }
    const startD = fromLocalInput(start, allDay)
    const endD   = fromLocalInput(end, allDay)
    if (endD < startD) { setError('종료가 시작보다 빠릅니다'); return }
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description || null,
        location: location || null,
        startAt: startD.toISOString(),
        endAt: endD.toISOString(),
        allDay,
        isPublic,
      }, initial?.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '일정 수정' : '새 일정'} disableOverlayClose>
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3 text-sm">
        <Input placeholder="제목" value={title} onChange={e => setTitle(e.target.value)} required maxLength={200} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
          <span>종일</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type={allDay ? 'date' : 'datetime-local'}
            value={start} onChange={e => setStart(e.target.value)} required
          />
          <Input
            type={allDay ? 'date' : 'datetime-local'}
            value={end} onChange={e => setEnd(e.target.value)} required
          />
        </div>
        <Input placeholder="위치 (선택)" value={location} onChange={e => setLocation(e.target.value)} maxLength={200} />
        <Textarea placeholder="설명 (선택)" value={description} onChange={e => setDescription(e.target.value)} maxLength={2000} rows={3} />
        <label className="flex items-start gap-2">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="mt-0.5" />
          <span>
            <span className="block">공개</span>
            <span className="block text-xs text-muted-foreground">공개 시 전사 모든 사용자가 볼 수 있습니다</span>
          </span>
        </label>
        {error && <div className="text-destructive text-xs">{error}</div>}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>취소</Button>
          <Button type="submit" disabled={submitting}>{submitting ? '저장 중…' : '저장'}</Button>
        </div>
      </form>
    </Modal>
  )
}
