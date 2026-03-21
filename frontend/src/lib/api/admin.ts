import { apiClient } from './client'
import { DashboardData } from '../types'

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/api/admin/dashboard')
  return data
}
