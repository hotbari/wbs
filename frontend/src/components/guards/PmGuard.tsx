'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PmGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isPM } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user !== null && !isAdmin && !isPM) router.replace('/employees')
  }, [user, isAdmin, isPM, router])

  if (!user || (!isAdmin && !isPM)) return null
  return <>{children}</>
}
