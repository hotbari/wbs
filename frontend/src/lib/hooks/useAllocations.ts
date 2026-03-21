'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Allocation, PageResponse } from '@/lib/types'

interface AllocationParams {
  employeeId?: string
  projectName?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}

export function useAllocations(params?: AllocationParams) {
  return useQuery({
    queryKey: ['allocations', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PageResponse<Allocation>>('/api/allocations', { params })
      return data
    },
  })
}

export function useCreateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await apiClient.post<Allocation>('/api/allocations', body)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })
}

export function useDeactivateAllocation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/allocations/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })
}
