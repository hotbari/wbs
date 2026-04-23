'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { Avatar, Card, CardBody, ProgressBar, Skeleton, EmptyState, PageTransition } from '@/components/ui/primitives'
import { Users, ChartBar, UserCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { EmployeeSummary } from '@/lib/types'

// Count-up hook — rAF-driven, frame-sync, cancels on unmount/target change
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (target === 0) { setCount(0); return }
    let startTime: number | null = null
    function step(ts: number) {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return count
}

function MetricBentoCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  showBar = false,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  showBar?: boolean
  delay?: number
}) {
  const animated = useCountUp(value)
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 28 }}
      whileHover={{ y: -4 }}
      className="bezel will-change-transform"
    >
      <div className="bezel-inner p-5">
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
      </div>
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
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                      'h-full w-full rounded-full',
                      isOver ? 'bg-destructive' : isWarn ? 'bg-warning' : 'bg-accent',
                    )}
                    style={{ transformOrigin: 'left' }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.min(allocationPercent, 100) / 100 }}
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
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="eyebrow">관리자 대시보드</p>
            <h1 className="heading-1">대시보드</h1>
          </div>
          {isLoading ? <DashboardSkeleton /> : data ? (
            <>
              {/* Row 1 — 3 metric tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <MetricBentoCard icon={Users} label="활성 직원" value={data.totalActiveEmployees} delay={0} />
                <MetricBentoCard icon={ChartBar} label="평균 할당률" value={Math.round(data.avgAllocationPercent)} suffix="%" showBar delay={0.06} />
                <MetricBentoCard icon={UserCircle} label="여유 인력" value={data.availableEmployees.length} delay={0.12} />
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
