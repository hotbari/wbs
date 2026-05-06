'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { calendarApi, type CalendarEventInput, type CalendarFilter } from '@/lib/api/calendar'

export function useCalendarEvents(from: string, to: string, filter: CalendarFilter) {
  return useQuery({
    queryKey: ['calendar', from, to, filter],
    queryFn: () => calendarApi.list(from, to, filter),
    staleTime: 30_000,
  })
}

export function useCreateCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CalendarEventInput) => calendarApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}

export function useUpdateCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CalendarEventInput }) =>
      calendarApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}

export function useDeleteCalendarEvent(invalidateKey: readonly unknown[]) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => calendarApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: invalidateKey }),
  })
}
