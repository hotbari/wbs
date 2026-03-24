'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyTasks, useProjectHealth } from '@/lib/hooks/useSidebar'
import { UsersThree, ListChecks, SignOut } from '@phosphor-icons/react'
import { Badge, Avatar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import SidebarPanel from '@/components/ui/SidebarPanel'

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className={cn(
        'relative text-sm transition-colors px-1 py-0.5',
        isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-[13px] left-0 right-0 h-0.5 bg-accent rounded-full" />
      )}
    </Link>
  )
}

export default function NavBar() {
  const { user, logout, isAdmin, isHydrated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: myTasks } = useMyTasks()
  const { data: health } = useProjectHealth()

  if (!user && isHydrated) return null
  if (!isHydrated) return (
    <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-14" />
    </nav>
  )

  const badgeCount = isAdmin
    ? (health?.filter(h => h.overdueTaskCount > 0).length ?? 0)
    : (myTasks?.length ?? 0)

  return (
    <>
      <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link href="/employees" className="flex items-center gap-2 font-semibold text-foreground">
              <UsersThree className="h-5 w-5 text-accent" weight="duotone" />
              Workforce
            </Link>
            <div className="flex items-center gap-4">
              <NavLink href="/employees">직원</NavLink>
              <NavLink href="/projects">프로젝트</NavLink>
              {isAdmin && (
                <>
                  <NavLink href="/admin/allocations">할당</NavLink>
                  <NavLink href="/admin/skills">스킬</NavLink>
                  <NavLink href="/admin/dashboard">대시보드</NavLink>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-[var(--radius-md)] hover:bg-muted"
            >
              <ListChecks className="h-4 w-4" />
              업무
              {badgeCount > 0 && (
                <Badge variant="danger" className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {badgeCount}
                </Badge>
              )}
            </button>
            <Link href="/me">
              <Avatar name={user!.email} size="sm" className="cursor-pointer hover:ring-2 hover:ring-accent transition-all" />
            </Link>
            <button
              onClick={logout}
              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-[var(--radius-sm)]"
            >
              <SignOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>
      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
