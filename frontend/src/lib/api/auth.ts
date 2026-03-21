import { apiClient } from './client'

export async function login(email: string, password: string): Promise<{ accessToken: string }> {
  const { data } = await apiClient.post<{ accessToken: string }>('/api/auth/login', { email, password })
  localStorage.setItem('accessToken', data.accessToken)
  return data
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout')
  localStorage.removeItem('accessToken')
}
