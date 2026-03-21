'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function NavBar() {
  const { user, logout, isAdmin } = useAuth()

  if (!user) return null

  return (
    <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link href="/employees" className="font-semibold text-blue-600">Workforce</Link>
        <Link href="/employees" className="text-sm text-gray-600 hover:text-gray-900">Employees</Link>
        {isAdmin && (
          <>
            <Link href="/admin/allocations" className="text-sm text-gray-600 hover:text-gray-900">Allocations</Link>
            <Link href="/admin/skills" className="text-sm text-gray-600 hover:text-gray-900">Skills</Link>
            <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user.email}</span>
        <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Sign out</button>
      </div>
    </nav>
  )
}
