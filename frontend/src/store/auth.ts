import { AuthUser } from '@/lib/types'

const KEY = 'auth_user'

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as AuthUser) : null
}

export function storeUser(user: AuthUser): void {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(KEY)
  localStorage.removeItem('accessToken')
}
