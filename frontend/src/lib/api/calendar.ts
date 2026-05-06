import { apiClient } from './client'

export type CalendarFilter = 'ALL' | 'MINE' | 'PUBLIC'

export interface CalendarEventDTO {
  id: string
  ownerUserId: string
  ownerName: string
  ownerInitial: string
  title: string
  description: string | null
  location: string | null
  startAt: string  // ISO Instant
  endAt: string
  allDay: boolean
  isPublic: boolean
  isMine: boolean
}

export interface CalendarEventInput {
  title: string
  description?: string | null
  location?: string | null
  startAt: string
  endAt: string
  allDay: boolean
  isPublic: boolean
}

export const calendarApi = {
  list: (from: string, to: string, filter: CalendarFilter = 'ALL') =>
    apiClient.get<CalendarEventDTO[]>('/api/calendar/events', { params: { from, to, filter } })
       .then(r => r.data),

  get: (id: string) =>
    apiClient.get<CalendarEventDTO>(`/api/calendar/events/${id}`).then(r => r.data),

  create: (input: CalendarEventInput) =>
    apiClient.post<CalendarEventDTO>('/api/calendar/events', input).then(r => r.data),

  update: (id: string, input: CalendarEventInput) =>
    apiClient.put<CalendarEventDTO>(`/api/calendar/events/${id}`, input).then(r => r.data),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/calendar/events/${id}`).then(() => undefined),
}
