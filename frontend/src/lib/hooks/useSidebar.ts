'use client'
import { useQuery } from '@tanstack/react-query'
import { getMyTasks, getProjectHealth } from '@/lib/api/sidebar'

export function useMyTasks() {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: getMyTasks,
    staleTime: 30_000,
  })
}

export function useProjectHealth() {
  return useQuery({
    queryKey: ['project-health'],
    queryFn: getProjectHealth,
    staleTime: 30_000,
  })
}
