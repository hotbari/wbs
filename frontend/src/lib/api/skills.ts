import { apiClient } from './client'
import { Skill } from '../types'

export async function listSkills(params?: { category?: string }): Promise<Skill[]> {
  const { data } = await apiClient.get<Skill[]>('/api/skills', { params })
  return data
}

export async function getSkill(id: string): Promise<Skill> {
  const { data } = await apiClient.get<Skill>(`/api/skills/${id}`)
  return data
}

export async function createSkill(body: { name: string; category: string; description?: string }): Promise<Skill> {
  const { data } = await apiClient.post<Skill>('/api/skills', body)
  return data
}

export async function updateSkill(id: string, body: { name: string; category: string; description?: string }): Promise<Skill> {
  const { data } = await apiClient.patch<Skill>(`/api/skills/${id}`, body)
  return data
}

export async function deleteSkill(id: string): Promise<void> {
  await apiClient.delete(`/api/skills/${id}`)
}

export async function addEmployeeSkill(
  employeeId: string,
  body: { skillId: string; proficiency: string; certified?: boolean; note?: string }
) {
  const { data } = await apiClient.post(`/api/employees/${employeeId}/skills`, body)
  return data
}

export async function updateEmployeeSkill(
  employeeId: string,
  skillId: string,
  body: { proficiency: string; certified?: boolean; note?: string }
) {
  const { data } = await apiClient.patch(`/api/employees/${employeeId}/skills/${skillId}`, body)
  return data
}

export async function removeEmployeeSkill(employeeId: string, skillId: string): Promise<void> {
  await apiClient.delete(`/api/employees/${employeeId}/skills/${skillId}`)
}
