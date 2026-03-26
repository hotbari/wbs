'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyTasks, useProjectHealth } from '@/lib/hooks/useSidebar'
import { UsersThree, ListChecks, SignOut, Sun, Moon } from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge, Avatar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import SidebarPanel from '@/components/ui/SidebarPanel'

/* ── Morphing hamburger icon ── */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative flex flex-col justify-between w-[18px] h-[13px]">
      <motion.span
        animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="block w-full h-[1.5px] bg-current rounded-full origin-center"
      />
      <motion.span
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="block w-full h-[1.5px] bg-current rounded-full"
      />
      <motion.span
        animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="block w-full h-[1.5px] bg-current rounded-full origin-center"
      />
    </div>
  )
}

/* ── Desktop nav link with layoutId sliding pill ── */
function NavLink({ href, children, onClick }: {
  href: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'relative px-3 py-1.5 rounded-full text-sm transition-colors',
        'duration-300 [transition-timing-function:var(--ease-expo-out)]',
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

/* ── Full-screen mobile menu overlay ── */
const OVERLAY_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
}

const LINK_VARIANTS = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.055, type: 'spring' as const, stiffness: 400, damping: 32 },
  }),
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
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-3rem)] max-w-[860px]">
      <div className="glass rounded-full border border-border/60 shadow-lg h-14" />
    </div>
  )

  const badgeCount = isAdmin
    ? (health?.filter(h => h.overdueTaskCount > 0).length ?? 0)
    : (myTasks?.length ?? 0)

  const closeMenu = () => setMenuOpen(false)

  const navItems = [
    { href: '/employees', label: '직원' },
    { href: '/projects', label: '프로젝트' },
    ...((isAdmin || isPM) ? [{ href: '/pm/staffing', label: '인력 요청' }] : []),
    ...(isAdmin ? [
      { href: '/admin/allocations', label: '할당' },
      { href: '/admin/skills', label: '스킬' },
      { href: '/admin/dashboard', label: '대시보드' },
    ] : []),
  ]

  return (
    <>
      {/* ── Floating island nav pill ── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-3rem)] max-w-[860px]">
        <div className="glass rounded-full border border-border/60 shadow-xl px-4 sm:px-5 h-14 flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/employees"
            className="flex items-center gap-2 font-semibold text-foreground shrink-0"
            onClick={closeMenu}
          >
            <UsersThree className="h-5 w-5 text-accent" weight="duotone" />
            <span className="hidden sm:inline">Workforce</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map(item => (
              <NavLink key={item.href} href={item.href}>{item.label}</NavLink>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Tasks button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="relative flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-2 rounded-full hover:bg-muted/80"
            >
              <ListChecks className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">업무</span>
              {badgeCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {badgeCount}
                </Badge>
              )}
            </button>

            {/* Avatar */}
            <Link href="/me" onClick={closeMenu}>
              <motion.div
                className={cn('rounded-full', badgeCount > 0 && 'animate-pulse-ring')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Avatar
                  name={user!.email}
                  size="sm"
                  className="cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                />
              </motion.div>
            </Link>

            {/* Theme toggle */}
            <motion.button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              whileTap={{ rotate: 20, scale: 0.88 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className="hidden sm:flex text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted/80"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {/* Logout — desktop only */}
            <button
              onClick={logout}
              aria-label="로그아웃"
              className="hidden sm:flex text-muted-foreground hover:text-destructive transition-colors p-2 rounded-full hover:bg-muted/80"
            >
              <SignOut className="h-4 w-4" />
            </button>

            {/* Mobile hamburger */}
            <motion.button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={menuOpen}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="sm:hidden p-2.5 text-foreground rounded-full hover:bg-muted/80 transition-colors"
            >
              <HamburgerIcon open={menuOpen} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Full-screen mobile overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-overlay"
            variants={OVERLAY_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-20 sm:hidden"
            style={{
              background: 'color-mix(in srgb, var(--background) 88%, transparent)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Close tap outside */}
            <div className="absolute inset-0" onClick={closeMenu} />

            {/* Nav links — centered, staggered */}
            <div className="relative flex flex-col items-center justify-center min-h-[100dvh] gap-2 px-8">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  custom={i}
                  variants={LINK_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="w-full max-w-xs"
                >
                  <NavLink href={item.href} onClick={closeMenu}>
                    <span className="text-2xl font-semibold">{item.label}</span>
                  </NavLink>
                </motion.div>
              ))}

              {/* Divider actions */}
              <motion.div
                custom={navItems.length}
                variants={LINK_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4 mt-6 pt-6 border-t border-border/50 w-full max-w-xs justify-center"
              >
                <motion.button
                  onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-3 rounded-full hover:bg-muted/80"
                >
                  {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </motion.button>
                <button
                  onClick={() => { logout(); closeMenu() }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-destructive transition-colors p-3 rounded-full hover:bg-muted/80"
                >
                  <SignOut className="h-5 w-5" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarPanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} isAdmin={isAdmin} />
    </>
  )
}
