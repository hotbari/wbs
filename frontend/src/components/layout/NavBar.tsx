'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyTasks, useProjectHealth } from '@/lib/hooks/useSidebar'
import SidebarPanel from '@/components/ui/SidebarPanel'

export default function NavBar() {
  const { user, logout, isAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: myTasks } = useMyTasks()
  const { data: health } = useProjectHealth()

  if (!user) return null

  const badgeCount = isAdmin
    ? (health?.filter(h => h.overdueTaskCount > 0).length ?? 0)
    : (myTasks?.length ?? 0)

  return (
    <>
      <nav className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/employees" className="font-semibold text-blue-600">Workforce</Link>
          <Link href="/employees" className="text-sm text-gray-600 hover:text-gray-900">Employees</Link>
          <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900">Projects</Link>
          {isAdmin && (
            <>
              <Link href="/admin/allocations" className="text-sm text-gray-600 hover:text-gray-900">Allocations</Link>
              <Link href="/admin/skills" className="text-sm text-gray-600 hover:text-gray-900">Skills</Link>
              <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="relative text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
          >
            Tasks
            {badgeCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {badgeCount}
              </span>
            )}
          </button>
          <span className="text-sm text-gray-500">{user.email}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Sign out</button>
        </div>
      </nav>
      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
