import { apiClient } from './client'

interface LoginResponseUser {
  id: string
  email: string
  role: string
  employeeId: string
}

interface LoginResponse {
  accessToken: string
  user: LoginResponseUser
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', { email, password })
  localStorage.setItem('accessToken', data.accessToken)
  document.cookie = 'logged_in=true; path=/; SameSite=Lax'
  return data
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/auth/logout')
  localStorage.removeItem('accessToken')
  document.cookie = 'logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}
