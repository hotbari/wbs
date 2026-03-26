# Frontend Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply design-taste-frontend principles to the WBS app — spring-physics motion, Bento dashboard layout, asymmetric employee list sidebar, premium hero detail page, and animated availability bars — using only already-installed dependencies (Framer Motion 12, Phosphor Icons, Geist).

**Architecture:** 8 files modified, 1 new file created (`LoginVisualPanel.tsx`). Foundation (`globals.css`) is already complete — all typography scale classes, keyframes, utility classes, and shadow tokens are already in place. Implementation proceeds from primitive components outward to pages. No new npm packages required.

**Tech Stack:** Next.js 14 App Router, Framer Motion 12, Tailwind CSS v4, Phosphor Icons, Geist Sans/Mono

> **Scope note:** `globals.css` already contains all required additions from the design spec (`.display-1`, `.display-2`, `.heading-1`, `.heading-2`, `.label-section`, `pulse-ring`/`float`/`count-up` keyframes, `.glass`, `.spotlight-border`, `.mesh-gradient`, `--shadow-card-hover`). Skip it entirely.

---

## File Map

### Modified files
- `frontend/src/components/ui/primitives/Button.tsx` — convert `<button>` to `motion.button` with spring press
- `frontend/src/components/ui/primitives/Card.tsx` — add `'use client'` + `MotionCard` export
- `frontend/src/components/ui/primitives/StaggerList.tsx` — update variants to spring physics
- `frontend/src/components/ui/primitives/index.ts` — re-export `MotionCard`
- `frontend/src/components/layout/NavBar.tsx` — `layoutId` nav pill + `AnimatePresence` mobile menu + avatar pulse ring + theme toggle `whileTap`
- `frontend/src/app/login/page.tsx` — asymmetric split layout using `LoginVisualPanel`
- `frontend/src/components/ui/EmployeeCard.tsx` — `MotionCard` + proficiency dots + `spotlight-border`
- `frontend/src/app/employees/page.tsx` — sticky sidebar filters + 2-col employee grid
- `frontend/src/app/admin/dashboard/page.tsx` — Bento grid with count-up metric tiles + animated bars
- `frontend/src/app/employees/[id]/page.tsx` — hero header + 2-col layout + animated availability bars
- `frontend/src/components/ui/PhaseAccordion.tsx` — spring accordion + task row stagger

### New files
- `frontend/src/components/ui/LoginVisualPanel.tsx` — floating skill-tag visual panel for login right column

---

## Task 1: Button — spring press motion

**Files:**
- Modify: `frontend/src/components/ui/primitives/Button.tsx`

- [ ] **Step 1: Replace `<button>` with `motion.button`**

```tsx
'use client'
import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { CircleNotch } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-button-primary-bg text-white hover:bg-button-primary-hover shadow-sm',
  secondary: 'bg-card text-foreground border border-border hover:bg-muted shadow-sm',
  ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted',
  destructive: 'bg-destructive-dark text-white hover:bg-destructive shadow-sm',
} as const

const sizes = {
  sm: 'h-9 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
} as const

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading && <CircleNotch className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  ),
)
Button.displayName = 'Button'
export { Button }
```

> **Note:** `active:scale-[0.98]` is removed — Framer Motion's `whileTap` handles press feedback.

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/primitives/Button.tsx
git commit -m "feat: spring press on Button via motion.button"
```

---

## Task 2: Card — add MotionCard export

**Files:**
- Modify: `frontend/src/components/ui/primitives/Card.tsx`
- Modify: `frontend/src/components/ui/primitives/index.ts`

- [ ] **Step 1: Add `'use client'`, import motion, add `MotionCard`**

```tsx
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-[var(--radius-xl)] border border-border shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4 border-b border-border', className)} {...props} />
}

export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardProps) {
  return <div className={cn('px-5 py-4 border-t border-border', className)} {...props} />
}

export function MotionCard({ className, children, ...props }: CardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={cn(
        'bg-card rounded-[var(--radius-xl)] border border-border shadow-sm will-change-transform',
        className,
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: Re-export `MotionCard` from index.ts**

In `frontend/src/components/ui/primitives/index.ts`, change:

```ts
export { Card, CardHeader, CardBody, CardFooter } from './Card'
```

to:

```ts
export { Card, CardHeader, CardBody, CardFooter, MotionCard } from './Card'
```

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/primitives/Card.tsx \
        frontend/src/components/ui/primitives/index.ts
git commit -m "feat: add MotionCard with spring hover lift"
```

---

## Task 3: StaggerList — spring physics variants

**Files:**
- Modify: `frontend/src/components/ui/primitives/StaggerList.tsx`

- [ ] **Step 1: Update variants to spring physics**

```tsx
'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 380, damping: 28 },
  },
}

interface StaggerListProps {
  children: React.ReactNode
  className?: string
}

export function StaggerList({ children, className }: StaggerListProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: StaggerListProps) {
  return (
    <motion.div variants={item} className={cn(className)}>
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/primitives/StaggerList.tsx
git commit -m "feat: upgrade StaggerList to spring physics variants"
```

---

## Task 4: NavBar — layoutId nav pill + AnimatePresence menu + avatar pulse

**Files:**
- Modify: `frontend/src/components/layout/NavBar.tsx`

- [ ] **Step 1: Replace full file**

```tsx
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
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/NavBar.tsx
git commit -m "feat: layoutId nav pill, AnimatePresence mobile menu, avatar pulse ring"
```

---

## Task 5: Login — asymmetric split + LoginVisualPanel

**Files:**
- Create: `frontend/src/components/ui/LoginVisualPanel.tsx`
- Modify: `frontend/src/app/login/page.tsx`

- [ ] **Step 1: Create `LoginVisualPanel.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'

const TAGS = [
  { label: '백엔드 개발', delay: 0,   x: '10%', y: '15%', rotate: -8 },
  { label: '프로젝트 관리', delay: 0.8, x: '55%', y: '8%',  rotate: 5  },
  { label: 'React',        delay: 1.2, x: '75%', y: '25%', rotate: -3 },
  { label: '디자인 시스템', delay: 0.4, x: '5%',  y: '45%', rotate: 7  },
  { label: 'DevOps',       delay: 1.6, x: '60%', y: '42%', rotate: -12 },
  { label: '데이터 분석',   delay: 0.6, x: '20%', y: '65%', rotate: 4  },
  { label: 'TypeScript',   delay: 1.4, x: '10%', y: '82%', rotate: -4 },
]

export default function LoginVisualPanel() {
  return (
    <div className="relative overflow-hidden mesh-gradient min-h-[100dvh] hidden lg:block">
      {/* Large watermark text */}
      <div className="absolute inset-0 flex items-end p-12 pointer-events-none">
        <p
          className="font-bold leading-none tracking-tighter"
          style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: 'color-mix(in srgb, var(--accent) 12%, var(--foreground) 6%)',
          }}
        >
          인력<br />배치
        </p>
      </div>
      {/* Floating skill tags */}
      {TAGS.map((tag, i) => (
        <motion.div
          key={tag.label}
          className="absolute"
          style={{ left: tag.x, top: tag.y }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: tag.delay, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <motion.span
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: tag.delay,
            }}
            className="inline-block px-3 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur-sm text-xs font-medium text-muted-foreground"
            style={{ rotate: tag.rotate }}
          >
            {tag.label}
          </motion.span>
        </motion.div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite `login/page.tsx`**

Replace the right column `<div>` with `<LoginVisualPanel />` and rewrite the left column for asymmetric top-left layout:

```tsx
'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Input, Button } from '@/components/ui/primitives'
import { UsersThree, WarningCircle } from '@phosphor-icons/react'
import LoginVisualPanel from '@/components/ui/LoginVisualPanel'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status: number } }
      setError(axiosErr.response?.status === 403
        ? '비활성화된 계정입니다'
        : '이메일 또는 비밀번호가 올바르지 않습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[100dvh]">
      {/* Left column — asymmetric top-left layout */}
      <div className="flex flex-col justify-between min-h-[100dvh] p-8 lg:p-12">
        {/* Logo top-left */}
        <div className="flex items-center gap-2">
          <UsersThree className="h-5 w-5 text-accent" weight="duotone" />
          <span className="font-semibold text-foreground">Workforce</span>
        </div>

        {/* Form — vertically centered */}
        <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
          <div>
            <p className="label-section mb-2">인력 배치 관리 플랫폼</p>
            <h1 className="display-2">로그인</h1>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive-light border border-destructive/20 rounded-[var(--radius-md)] px-3 py-2">
              <WarningCircle className="h-4 w-4 shrink-0" weight="bold" />{error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">이메일</label>
              <Input type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">비밀번호</label>
              <Input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            로그인
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">© 2026 Workforce</p>
      </div>

      {/* Right column — floating tags visual */}
      <LoginVisualPanel />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/ui/LoginVisualPanel.tsx \
        frontend/src/app/login/page.tsx
git commit -m "feat: asymmetric login split with floating skill-tag visual panel"
```

---

## Task 6: EmployeeCard — MotionCard + proficiency dots + spotlight-border

**Files:**
- Modify: `frontend/src/components/ui/EmployeeCard.tsx`

- [ ] **Step 1: Replace full file**

```tsx
'use client'
import Link from 'next/link'
import { MotionCard, CardBody, Avatar, ProgressBar } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import type { EmployeeSummary } from '@/lib/types'

const PROF_DOTS = { BEGINNER: 1, INTERMEDIATE: 2, EXPERT: 3 } as const

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`} className="group block">
      <MotionCard className="spotlight-border h-full">
        <CardBody className="space-y-4 py-5">
          {/* Header: Avatar + name + department badge */}
          <div className="flex items-start gap-3">
            <Avatar name={employee.fullName} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[0.9375rem] truncate group-hover:text-accent transition-colors">
                {employee.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{employee.jobTitle}</p>
              <span className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                {employee.department}
              </span>
            </div>
          </div>

          {/* Allocation bar + number */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <p className="label-section">배정률</p>
              <span className={cn(
                'text-xs font-mono font-medium',
                employee.totalAllocationPercent >= 100 ? 'text-destructive' :
                employee.totalAllocationPercent >= 80  ? 'text-warning' :
                'text-accent',
              )}>
                {employee.totalAllocationPercent}%
              </span>
            </div>
            <ProgressBar value={employee.totalAllocationPercent} size="sm" />
          </div>

          {/* Skills with proficiency dots */}
          {employee.topSkills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {employee.topSkills.slice(0, 3).map(s => (
                <span
                  key={s.skillId}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-sm)] bg-accent-light/40 text-[11px] font-medium text-accent-text"
                >
                  {s.name}
                  <span className="flex gap-0.5 ml-0.5">
                    {[1, 2, 3].map(n => (
                      <span
                        key={n}
                        className={cn(
                          'w-1 h-1 rounded-full',
                          n <= (PROF_DOTS[s.proficiency as keyof typeof PROF_DOTS] ?? 1)
                            ? 'bg-accent'
                            : 'bg-muted-foreground/30',
                        )}
                      />
                    ))}
                  </span>
                </span>
              ))}
            </div>
          )}
        </CardBody>
      </MotionCard>
    </Link>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/EmployeeCard.tsx
git commit -m "feat: EmployeeCard redesign with MotionCard, proficiency dots, spotlight-border"
```

---

## Task 7: Employees page — sticky sidebar + 2-col grid

**Files:**
- Modify: `frontend/src/app/employees/page.tsx`

- [ ] **Step 1: Replace full file**

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import EmployeeCard from '@/components/ui/EmployeeCard'
import SkillFilterPanel from '@/components/ui/SkillFilterPanel'
import { Button, Input, Select, Skeleton, SkeletonCircle, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Plus, MagnifyingGlass, Users, Funnel } from '@phosphor-icons/react'
import { Card, CardBody } from '@/components/ui/primitives'

function EmployeeCardSkeleton() {
  return (
    <Card><CardBody>
      <div className="flex items-center gap-3 mb-3">
        <SkeletonCircle />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /></div>
      </div>
      <Skeleton className="h-1.5 w-full" />
      <Skeleton className="h-3 w-20 mt-1.5" />
    </CardBody></Card>
  )
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [maxAllocationPercent, setMaxAllocationPercent] = useState<number | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { isAdmin } = useAuth()
  const { data, isLoading, error } = useEmployeeList({
    search: search || undefined,
    department: department || undefined,
    skillIds: selectedSkillIds.length > 0 ? selectedSkillIds : undefined,
    maxAllocationPercent,
    page,
  })

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  function resetPage() { setPage(1) }

  const filterContent = (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <p className="label-section">이름 검색</p>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름으로 검색..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            className="pl-9"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="label-section">부서</p>
        <Input
          placeholder="부서 입력..."
          value={department}
          onChange={e => { setDepartment(e.target.value); resetPage() }}
        />
      </div>
      <div className="space-y-1.5">
        <p className="label-section">스킬 필터</p>
        <SkillFilterPanel
          selectedSkillIds={selectedSkillIds}
          onChange={ids => { setSelectedSkillIds(ids); resetPage() }}
        />
      </div>
      <div className="space-y-1.5">
        <p className="label-section">최대 배정률</p>
        <Select
          value={maxAllocationPercent ?? ''}
          onChange={e => { setMaxAllocationPercent(e.target.value ? Number(e.target.value) : undefined); resetPage() }}
        >
          <option value="">제한 없음</option>
          <option value="50">50% 이하</option>
          <option value="80">80% 이하</option>
          <option value="100">100% 이하</option>
        </Select>
      </div>
    </div>
  )

  return (
    <PageTransition>
      <div className="flex gap-6">
        {/* Sticky sidebar — desktop only */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="flex items-center justify-between mb-5">
              <h2 className="heading-2">직원 목록</h2>
              {isAdmin && (
                <Link href="/admin/employees/new">
                  <Button size="sm"><Plus className="h-4 w-4" />추가</Button>
                </Link>
              )}
            </div>
            {filterContent}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-12">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h1 className="heading-1">직원 목록</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMobileFiltersOpen(o => !o)}
              >
                <Funnel className="h-4 w-4" />
                필터
                {(selectedSkillIds.length > 0 || search || department || maxAllocationPercent) && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Button>
              {isAdmin && (
                <Link href="/admin/employees/new">
                  <Button size="sm"><Plus className="h-4 w-4" />추가</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile filters collapse */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                key="mobile-filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                className="lg:hidden overflow-hidden mb-4"
              >
                <Card><CardBody>{filterContent}</CardBody></Card>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive mb-6">
              직원 목록을 불러오지 못했습니다.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <EmployeeCardSkeleton key={i} />)}
            </div>
          ) : data?.data.length === 0 ? (
            <EmptyState icon={Users} heading="직원을 찾을 수 없습니다" description="검색어나 필터를 조정해 보세요." />
          ) : (
            <StaggerList className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.data.map(emp => (
                <StaggerItem key={emp.id}><EmployeeCard employee={emp} /></StaggerItem>
              ))}
            </StaggerList>
          )}

          {data && totalPages > 1 && (
            <div className="flex items-center gap-2 mt-8 justify-center">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>이전</Button>
              <span className="text-sm text-muted-foreground px-2">{page} / {totalPages} 페이지</span>
              <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>다음</Button>
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/employees/page.tsx
git commit -m "feat: employee directory sidebar layout with 2-col grid and mobile filter collapse"
```

---

## Task 8: Dashboard — Bento grid with count-up tiles + animated bars

**Files:**
- Modify: `frontend/src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: Replace full file**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { Avatar, Card, CardBody, ProgressBar, Skeleton, EmptyState, PageTransition } from '@/components/ui/primitives'
import { Users, ChartBar, UserCircle, TrendUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { EmployeeSummary } from '@/lib/types'

// Count-up hook
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (target === 0) return
    const interval = 40
    const steps = Math.ceil(duration / interval)
    let step = 0
    const timer = setInterval(() => {
      step++
      setCount(Math.round((target * step) / steps))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function MetricBentoCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  showBar = false,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  showBar?: boolean
}) {
  const animated = useCountUp(value)
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="relative bg-card rounded-[var(--radius-xl)] border border-border shadow-sm overflow-hidden p-5"
    >
      {/* Corner glow */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-accent/8 blur-2xl pointer-events-none" />
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-accent" weight="duotone" />
        <p className="label-section">{label}</p>
      </div>
      <p className="text-4xl font-bold font-mono tabular-nums tracking-tighter animate-count-in">
        {animated}{suffix}
      </p>
      {showBar && (
        <div className="mt-3">
          <ProgressBar value={value} />
        </div>
      )}
    </motion.div>
  )
}

function AvailabilityBentoCard({ employees }: { employees: EmployeeSummary[] }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center gap-2 mb-4">
          {/* Live pulse dot */}
          <motion.span
            className="w-2 h-2 rounded-full bg-accent inline-block"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <p className="label-section">여유 인력 (향후 30일)</p>
        </div>
        {employees.length === 0 ? (
          <EmptyState icon={Users} heading="여유 인력이 없습니다" className="py-6" />
        ) : (
          <div className="space-y-2">
            {employees.map((e, i) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.055, type: 'spring', stiffness: 380, damping: 28 }}
                className="flex items-center gap-3 py-1.5"
              >
                <Avatar name={e.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{e.fullName}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.department}</p>
                </div>
                <span className="text-xs font-mono font-medium text-accent">
                  {100 - e.totalAllocationPercent}% 가용
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function OverAllocatedBentoCard({ items }: { items: { employee: EmployeeSummary; allocationPercent: number }[] }) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <p className="label-section">고할당 직원</p>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning inline-block" />80%+
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive inline-block" />100%+
            </span>
          </div>
        </div>
        <div className="space-y-3">
          {items.map(({ employee, allocationPercent }, i) => {
            const isOver = allocationPercent >= 100
            const isWarn = allocationPercent >= 80 && allocationPercent < 100
            return (
              <div key={employee.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium truncate">{employee.fullName}</span>
                  <span className={cn(
                    'font-mono font-medium',
                    isOver ? 'text-destructive' : isWarn ? 'text-warning' : 'text-muted-foreground',
                  )}>
                    {allocationPercent}%
                  </span>
                </div>
                <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full',
                      isOver ? 'bg-destructive' : isWarn ? 'bg-warning' : 'bg-accent',
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(allocationPercent, 100)}%` }}
                    transition={{ delay: i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardBody>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardBody><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-10 w-16" /></CardBody></Card>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  return (
    <AdminGuard>
      <PageTransition>
        <div className="space-y-6">
          <h1 className="heading-1">대시보드</h1>
          {isLoading ? <DashboardSkeleton /> : data ? (
            <>
              {/* Row 1 — 3 metric tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricBentoCard icon={Users} label="활성 직원" value={data.totalActiveEmployees} />
                <MetricBentoCard icon={ChartBar} label="평균 할당률" value={Math.round(data.avgAllocationPercent)} suffix="%" showBar />
                <MetricBentoCard icon={UserCircle} label="여유 인력" value={data.availableEmployees.length} />
              </div>

              {/* Row 2 — 60/40 asymmetric */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-3">
                  <AvailabilityBentoCard employees={data.availableEmployees} />
                </div>
                <div className="lg:col-span-2">
                  <OverAllocatedBentoCard items={data.topOverAllocated} />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/admin/dashboard/page.tsx
git commit -m "feat: Bento dashboard with count-up metric tiles and animated allocation bars"
```

---

## Task 9: Employee detail page — hero header + 2-col layout + animated availability

**Files:**
- Modify: `frontend/src/app/employees/[id]/page.tsx`

- [ ] **Step 1: Replace full file**

```tsx
'use client'
import { useEmployee } from '@/lib/hooks/useEmployees'
import { useEmployeeTasks } from '@/lib/hooks/useEmployeeTasks'
import SkillBadge from '@/components/ui/SkillBadge'
import SkillFreshnessBadge from '@/components/ui/SkillFreshnessBadge'
import EmployeeTaskList from '@/components/ui/EmployeeTaskList'
import Link from 'next/link'
import { use, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { EmployeeSkill, Allocation, Proficiency, AvailabilityPeriod } from '@/lib/types'
import { Avatar, Button, Card, CardBody, ProgressBar, Skeleton, SkeletonCircle, SkeletonText, PageTransition } from '@/components/ui/primitives'
import { PencilSimple, ShareNetwork } from '@phosphor-icons/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createShareLink } from '@/lib/api/share'
import { getEmployeeAvailability, listEmployeeSkills } from '@/lib/api/employees'
import { useSkillList } from '@/lib/hooks/useSkills'
import { cn } from '@/lib/utils'

function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 pb-8 border-b border-border">
        <SkeletonCircle className="h-14 w-14" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card><CardBody className="space-y-3"><SkeletonText lines={4} /></CardBody></Card>
        <Card><CardBody className="space-y-3"><SkeletonText lines={3} /></CardBody></Card>
      </div>
    </div>
  )
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee, isLoading } = useEmployee(id)
  const { data: tasks } = useEmployeeTasks(id)
  const { data: availability } = useQuery({
    queryKey: ['availability', id],
    queryFn: () => getEmployeeAvailability(id),
  })
  const { data: employeeSkills = [] } = useQuery({
    queryKey: ['employees', id, 'skills'],
    queryFn: () => listEmployeeSkills(id),
  })
  const { data: skillCatalog = [] } = useSkillList()
  const skillNameMap = Object.fromEntries(skillCatalog.map((s: { id: string; name: string }) => [s.id, s.name]))
  const { isAdmin } = useAuth()
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const { mutate: share, isPending: sharing } = useMutation({
    mutationFn: () => createShareLink(id),
    onSuccess: (res) => {
      navigator.clipboard.writeText(res.url).catch(() => setCopiedUrl(null))
      setCopiedUrl(res.url)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopiedUrl(null), 3000)
    },
  })

  if (isLoading) return <DetailSkeleton />
  if (!employee) return (
    <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive">
      직원을 찾을 수 없습니다.
    </div>
  )

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Hero header */}
        <div className="relative mb-2 pb-8 border-b border-border">
          <div className="absolute -top-4 -left-4 w-32 h-32 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <Avatar name={employee.fullName} size="xl" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="label-section mb-1">
                  {employee.department} · {employee.team ?? '팀 미지정'}
                </p>
                <h1 className="display-2">{employee.fullName}</h1>
                <p className="text-muted-foreground mt-1">{employee.jobTitle}</p>
              </motion.div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/employees/${employee.id}/edit`}>
                <Button variant="secondary" size="sm"><PencilSimple className="h-4 w-4" />수정</Button>
              </Link>
              {isAdmin && (
                <Button variant="secondary" size="sm" loading={sharing} onClick={() => share()}>
                  <ShareNetwork className="h-4 w-4" />
                  {copiedUrl ? '복사됨!' : '링크 공유'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2-col info + allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardBody className="space-y-3">
              <p className="label-section">상세 정보</p>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div><span className="text-muted-foreground">이메일:</span> {employee.email}</div>
                {employee.phone && <div><span className="text-muted-foreground">전화:</span> {employee.phone}</div>}
                <div><span className="text-muted-foreground">팀:</span> {employee.team ?? '—'}</div>
                <div><span className="text-muted-foreground">등급:</span> {employee.grade ?? '—'}</div>
                <div><span className="text-muted-foreground">유형:</span> {employee.employmentType === 'FULL_TIME' ? '정규직' : employee.employmentType === 'CONTRACT' ? '계약직' : '파트타임'}</div>
                <div><span className="text-muted-foreground">입사일:</span> {employee.hiredAt}</div>
              </div>
            </CardBody>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <p className="label-section">할당률 ({employee.totalAllocationPercent}%)</p>
                <ProgressBar value={employee.totalAllocationPercent} />
              </CardBody>
            </Card>

            {availability && availability.length > 0 && (
              <Card>
                <CardBody className="space-y-3">
                  <p className="label-section">향후 가용 예측</p>
                  <div className="space-y-3">
                    {availability.map((period: AvailabilityPeriod, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 350, damping: 28 }}
                        className="space-y-1"
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            {period.from}{period.to ? ` ~ ${period.to}` : ' 이후'}
                          </span>
                          <span className={cn(
                            'font-mono font-medium',
                            period.availablePercent >= 50 ? 'text-accent' :
                            period.availablePercent > 0   ? 'text-warning' :
                            'text-destructive',
                          )}>
                            {period.availablePercent}% 가용
                          </span>
                        </div>
                        <div className="h-1 bg-surface-subtle rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              'h-full rounded-full',
                              period.availablePercent >= 50 ? 'bg-accent' :
                              period.availablePercent > 0   ? 'bg-warning' :
                              'bg-destructive',
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${period.availablePercent}%` }}
                            transition={{ delay: 0.2 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        {employeeSkills.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <p className="label-section">스킬</p>
              <div className="flex flex-wrap gap-2">
                {employeeSkills.map((es: EmployeeSkill) => (
                  <div key={es.id} className="flex flex-col items-start gap-0.5">
                    <SkillBadge name={skillNameMap[es.skillId] ?? es.skillId} proficiency={es.proficiency as Proficiency} />
                    {es.updatedAt && <SkillFreshnessBadge updatedAt={es.updatedAt} />}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {employee.assignments.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <p className="label-section">프로젝트 배정</p>
              <div className="space-y-2">
                {employee.assignments.map((a: Allocation) => (
                  <div key={a.id} className="flex justify-between text-sm border border-border rounded-[var(--radius-lg)] p-3">
                    <div>
                      <p className="font-medium">{a.projectName}</p>
                      <p className="text-muted-foreground">{a.roleInProject}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{a.allocationPercent}%</p>
                      <p className="text-xs text-muted-foreground">{a.startDate} – {a.endDate ?? '진행 중'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody className="space-y-3">
            <p className="label-section">배정 업무 ({tasks?.length ?? 0})</p>
            <EmployeeTaskList tasks={tasks ?? []} />
          </CardBody>
        </Card>
      </div>
    </PageTransition>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/employees/[id]/page.tsx
git commit -m "feat: employee detail hero header, 2-col layout, animated availability bars"
```

---

## Task 10: PhaseAccordion — spring transition + task row stagger

**Files:**
- Modify: `frontend/src/components/ui/PhaseAccordion.tsx`

- [ ] **Step 1: Replace full file**

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CaretDown, Calendar, ListDashes } from '@phosphor-icons/react'
import { Badge, EmptyState } from '@/components/ui/primitives'
import type { PhaseDetail, TaskItem } from '@/lib/types'
import TaskRow from './TaskRow'

interface Props {
  phase: PhaseDetail
  onTaskClick: (task: TaskItem) => void
  adminActions?: React.ReactNode
}

export default function PhaseAccordion({ phase, onTaskClick, adminActions }: Props) {
  const [open, setOpen] = useState(true)
  const done = phase.tasks.filter(t => t.status === 'DONE').length
  return (
    <div className="border border-border rounded-[var(--radius-xl)] overflow-hidden mb-3">
      <motion.button
        className="w-full flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 text-left transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{phase.name}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {phase.startDate} → {phase.endDate}
          </span>
          <Badge variant={done === phase.tasks.length && phase.tasks.length > 0 ? 'success' : 'default'}>
            {done}/{phase.tasks.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {adminActions}
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <CaretDown className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </div>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="overflow-hidden"
          >
            {phase.tasks.length === 0 ? (
              <EmptyState icon={ListDashes} heading="업무가 없습니다" className="py-6" />
            ) : (
              <motion.div
                className="divide-y divide-border"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.03, delayChildren: 0.05 } },
                }}
              >
                {phase.tasks.map(task => (
                  <motion.div
                    key={task.id}
                    variants={{
                      hidden: { opacity: 0, x: -4 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
                      },
                    }}
                  >
                    <TaskRow task={task} onClick={onTaskClick} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/ui/PhaseAccordion.tsx
git commit -m "feat: spring accordion with task row stagger in PhaseAccordion"
```

---

## Final Verification

- [ ] **Full TypeScript check**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors

- [ ] **Production build**

```bash
cd frontend && npm run build
```

Expected: compiled successfully, no errors

- [ ] **Manual smoke test checklist**
  - [ ] Login page: asymmetric layout, floating skill tags animate in, watermark text visible (lg+), hidden on mobile
  - [ ] NavBar: pill slides smoothly between routes (no layout shift), mobile menu animates in/out with spring
  - [ ] NavBar: avatar shows pulse ring when there are tasks/alerts
  - [ ] NavBar: theme toggle has a `rotate + scale` tap animation
  - [ ] Employee list: sidebar filters visible on desktop (lg+), mobile filter collapse works with AnimatePresence
  - [ ] Employee cards: `MotionCard` lifts on hover with spring, `spotlight-border` gradient visible on hover, proficiency dots render (1/2/3 filled)
  - [ ] Dashboard: 3 metric tiles count up from 0 on mount, corner glow visible, `y: -3` hover lift works
  - [ ] Dashboard: availability list rows stagger in from left, live pulse dot animates
  - [ ] Dashboard: allocation bars animate from 0 to value with staggered delay
  - [ ] Employee detail: hero header entrance animation (avatar scale-in, name slide-in), 2-col layout on lg+
  - [ ] Employee detail: availability bars animate from 0 width on mount
  - [ ] PhaseAccordion: spring open/close (no linear easing), tasks stagger in from left when opened
  - [ ] Dark mode: toggle on all modified pages — CSS vars adapt correctly
  - [ ] `label-section` style: no uppercase, no tracking-wider, correct 11px size everywhere

---

*Plan generated: 2026-03-26 · Branch: design/taste-skill · Design Settings: VARIANCE=8, MOTION=6, DENSITY=4*
