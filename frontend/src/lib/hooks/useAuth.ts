'use client'
import { useState, useEffect } from 'react'
import { AuthUser } from '@/lib/types'
import { login as apiLogin, logout as apiLogout } from '@/lib/api/auth'
import { getStoredUser, storeUser, clearUser } from '@/store/auth'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setUser(getStoredUser())
    setIsHydrated(true)
  }, [])

  async function login(email: string, password: string) {
    const data = await apiLogin(email, password)
    const u: AuthUser = {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role as AuthUser['role'],
      employeeId: data.user.employeeId,
    }
    storeUser(u)
    setUser(u)
    router.push('/employees')
  }

  async function logout() {
    await apiLogout()
    clearUser()
    setUser(null)
    router.push('/login')
  }

  return { user, login, logout, isAdmin: user?.role === 'ADMIN', isPM: user?.role === 'PM', isHydrated }
}
