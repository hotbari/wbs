'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyTasks, useProjectHealth } from '@/lib/hooks/useSidebar'
import { UsersThree, ListChecks, SignOut, List, X, Sun, Moon } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge, Avatar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import SidebarPanel from '@/components/ui/SidebarPanel'

function NavLink({ href, children, mobile = false, onClick }: {
  href: string
  children: React.ReactNode
  mobile?: boolean
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          'flex items-center px-3 py-3 rounded-[var(--radius-md)] text-sm transition-colors',
          isActive
            ? 'text-foreground font-medium bg-muted'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        )}
      >
        {children}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn(
        'relative px-3 py-1.5 rounded-full text-sm transition-colors',
        isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {isActive && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 bg-muted rounded-full"
          style={{ zIndex: -1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      {children}
    </Link>
  )
}

export default function NavBar() {
  const { user, logout, isAdmin, isPM, isHydrated } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { data: myTasks } = useMyTasks(!!user)
  const { data: health } = useProjectHealth(isAdmin)

  if (!user && isHydrated) return null
  if (!isHydrated) return (
    <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14" />
    </nav>
  )

  const badgeCount = isAdmin
    ? (health?.filter(h => h.overdueTaskCount > 0).length ?? 0)
    : (myTasks?.length ?? 0)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Main row */}
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link
                href="/employees"
                className="flex items-center gap-2 font-semibold text-foreground"
                onClick={closeMenu}
              >
                <UsersThree className="h-5 w-5 text-accent" weight="duotone" />
                Workforce
              </Link>
              {/* Desktop nav links */}
              <div className="hidden sm:flex items-center gap-1">
                <NavLink href="/employees">직원</NavLink>
                <NavLink href="/projects">프로젝트</NavLink>
                {(isAdmin || isPM) && (
                  <NavLink href="/pm/staffing">인력 요청</NavLink>
                )}
                {isAdmin && (
                  <>
                    <NavLink href="/admin/allocations">할당</NavLink>
                    <NavLink href="/admin/skills">스킬</NavLink>
                    <NavLink href="/admin/dashboard">대시보드</NavLink>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2.5 rounded-[var(--radius-md)] hover:bg-muted"
              >
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">업무</span>
                {badgeCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1.5 -right-1.5 h-4 min-w-[16px] px-1 flex items-center justify-center">
                    {badgeCount}
                  </Badge>
                )}
              </button>
              <Link href="/me" onClick={closeMenu}>
                <motion.div
                  className={cn('rounded-full', badgeCount > 0 && 'animate-pulse-ring')}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Avatar name={user!.email} size="sm" className="cursor-pointer hover:ring-2 hover:ring-accent transition-all" />
                </motion.div>
              </Link>
              <motion.button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
                whileTap={{ rotate: 15, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="text-muted-foreground hover:text-foreground transition-colors p-2.5 rounded-[var(--radius-sm)] hover:bg-muted"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
              <button
                onClick={logout}
                aria-label="로그아웃"
                className="hidden sm:flex text-muted-foreground hover:text-destructive transition-colors p-2.5 rounded-[var(--radius-sm)]"
              >
                <SignOut className="h-4 w-4" />
              </button>
              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(o => !o)}
                aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
                aria-expanded={menuOpen}
                className="sm:hidden p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-[var(--radius-md)] hover:bg-muted"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown menu — AnimatePresence */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="mobile-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="sm:hidden overflow-hidden border-t border-border"
              >
                <div className="py-2 flex flex-col gap-0.5">
                  <NavLink href="/employees" mobile onClick={closeMenu}>직원</NavLink>
                  <NavLink href="/projects" mobile onClick={closeMenu}>프로젝트</NavLink>
                  {(isAdmin || isPM) && (
                    <NavLink href="/pm/staffing" mobile onClick={closeMenu}>인력 요청</NavLink>
                  )}
                  {isAdmin && (
                    <>
                      <NavLink href="/admin/allocations" mobile onClick={closeMenu}>할당</NavLink>
                      <NavLink href="/admin/skills" mobile onClick={closeMenu}>스킬</NavLink>
                      <NavLink href="/admin/dashboard" mobile onClick={closeMenu}>대시보드</NavLink>
                    </>
                  )}
                  <div className="border-t border-border mt-2 pt-2">
                    <button
                      onClick={() => { logout(); closeMenu() }}
                      className="flex items-center gap-2 w-full px-3 py-3 text-sm text-muted-foreground hover:text-destructive hover:bg-muted rounded-[var(--radius-md)] transition-colors"
                    >
                      <SignOut className="h-4 w-4" />
                      로그아웃
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
