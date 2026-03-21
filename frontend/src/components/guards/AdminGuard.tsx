'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user !== null && !isAdmin) router.replace('/employees')
  }, [user, isAdmin, router])

  if (!user || !isAdmin) return null
  return <>{children}</>
}
