import { apiClient } from './client'
import type { MyTask } from '@/lib/types'

export async function getEmployeeTasks(employeeId: string): Promise<MyTask[]> {
  const { data } = await apiClient.get<MyTask[]>(`/api/employees/${employeeId}/tasks`)
  return data
}
