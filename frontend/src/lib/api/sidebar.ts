import { apiClient } from './client'
import type { MyTask, ProjectHealth } from '@/lib/types'

export async function getMyTasks() {
  const { data } = await apiClient.get<MyTask[]>('/api/me/tasks')
  return data
}

export async function getProjectHealth() {
  const { data } = await apiClient.get<ProjectHealth[]>('/api/admin/projects/health')
  return data
}
