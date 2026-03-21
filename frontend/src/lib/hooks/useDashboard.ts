'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { DashboardData } from '@/lib/types'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardData>('/api/admin/dashboard')
      return data
    },
    staleTime: 30_000,
  })
}
