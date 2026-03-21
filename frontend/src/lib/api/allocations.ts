import { apiClient } from './client'
import { Allocation, PageResponse } from '../types'

export async function listAllocations(params?: {
  employeeId?: string
  projectName?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}): Promise<PageResponse<Allocation>> {
  const { data } = await apiClient.get<PageResponse<Allocation>>('/api/allocations', { params })
  return data
}

export async function createAllocation(body: {
  employeeId: string
  projectName: string
  roleInProject: string
  allocationPercent: number
  startDate: string
  endDate?: string
}): Promise<Allocation> {
  const { data } = await apiClient.post<Allocation>('/api/allocations', body)
  return data
}

export async function updateAllocation(id: string, body: {
  projectName?: string
  roleInProject?: string
  allocationPercent?: number
  startDate?: string
  endDate?: string
  isActive?: boolean
}): Promise<Allocation> {
  const { data } = await apiClient.patch<Allocation>(`/api/allocations/${id}`, body)
  return data
}

export async function deactivateAllocation(id: string): Promise<void> {
  await apiClient.delete(`/api/allocations/${id}`)
}
