import { apiClient } from './client'
import type { ProjectSummary, ProjectDetail, PhaseDetail, TaskItem, Comment, PageResponse } from '@/lib/types'

export async function listProjects(params?: { status?: string; page?: number; pageSize?: number }) {
  const { data } = await apiClient.get<PageResponse<ProjectSummary>>('/api/projects', { params })
  return data
}

export async function getProject(id: string) {
  const { data } = await apiClient.get<ProjectDetail>(`/api/projects/${id}`)
  return data
}

export async function createProject(body: { name: string; description?: string; startDate: string; endDate?: string }) {
  const { data } = await apiClient.post<ProjectDetail>('/api/projects', body)
  return data
}

export async function updateProject(id: string, body: Record<string, unknown>) {
  const { data } = await apiClient.patch<ProjectDetail>(`/api/projects/${id}`, body)
  return data
}

export async function archiveProject(id: string) {
  const { data } = await apiClient.delete<ProjectDetail>(`/api/projects/${id}`)
  return data
}

export async function createPhase(projectId: string, body: { name: string; startDate: string; endDate: string; orderIndex: number }) {
  const { data } = await apiClient.post<PhaseDetail>(`/api/projects/${projectId}/phases`, body)
  return data
}

export async function updatePhase(id: string, body: Record<string, unknown>) {
  const { data } = await apiClient.patch<PhaseDetail>(`/api/phases/${id}`, body)
  return data
}

export async function deletePhase(id: string) {
  await apiClient.delete(`/api/phases/${id}`)
}

export async function createTask(phaseId: string, body: { title: string; description?: string; assigneeId?: string; dueDate?: string }) {
  const { data } = await apiClient.post<TaskItem>(`/api/phases/${phaseId}/tasks`, body)
  return data
}

export async function updateTask(id: string, body: Record<string, unknown>) {
  const { data } = await apiClient.patch<TaskItem>(`/api/tasks/${id}`, body)
  return data
}

export async function deleteTask(id: string) {
  await apiClient.delete(`/api/tasks/${id}`)
}

export async function getComments(taskId: string) {
  const { data } = await apiClient.get<Comment[]>(`/api/tasks/${taskId}/comments`)
  return data
}

export async function createComment(taskId: string, body: string) {
  const { data } = await apiClient.post<Comment>(`/api/tasks/${taskId}/comments`, { body })
  return data
}

export async function deleteComment(id: string) {
  await apiClient.delete(`/api/comments/${id}`)
}
