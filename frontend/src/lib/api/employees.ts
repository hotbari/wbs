import { apiClient } from './client'
import { EmployeeDetail, EmployeeSummary, PageResponse } from '../types'

export async function listEmployees(params?: {
  search?: string
  department?: string
  skillIds?: string[]
  maxAllocationPercent?: number
  page?: number
  pageSize?: number
}): Promise<PageResponse<EmployeeSummary>> {
  const { data } = await apiClient.get<PageResponse<EmployeeSummary>>('/api/employees', { params })
  return data
}

export async function getEmployee(id: string): Promise<EmployeeDetail> {
  const { data } = await apiClient.get<EmployeeDetail>(`/api/employees/${id}`)
  return data
}

export async function createEmployee(body: Record<string, unknown>): Promise<EmployeeDetail> {
  const { data } = await apiClient.post<EmployeeDetail>('/api/employees', body)
  return data
}

export async function updateEmployee(id: string, body: Record<string, unknown>): Promise<EmployeeDetail> {
  const { data } = await apiClient.patch<EmployeeDetail>(`/api/employees/${id}`, body)
  return data
}

export async function deactivateEmployee(id: string): Promise<void> {
  await apiClient.delete(`/api/employees/${id}`)
}

export async function listAvailableEmployees(params: {
  minAvailablePercent: number
  fromDate: string
  toDate: string
}): Promise<PageResponse<EmployeeSummary>> {
  const { data } = await apiClient.get<PageResponse<EmployeeSummary>>('/api/employees/available', { params })
  return data
}

export async function listEmployeeAllocations(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/allocations`)
  return data
}

export async function listEmployeeSkills(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/skills`)
  return data
}
