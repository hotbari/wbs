'use client'
import { useState, useDeferredValue } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import EmployeeCard from '@/components/ui/EmployeeCard'
import SkillFilterPanel from '@/components/ui/SkillFilterPanel'
import { Button, Input, Select, Skeleton, SkeletonCircle, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Plus, MagnifyingGlass, Users, Funnel } from '@phosphor-icons/react'
import { Card, CardBody } from '@/components/ui/primitives'
import WelcomeBanner from '@/components/ui/WelcomeBanner'

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
  const deferredSearch = useDeferredValue(search)
  const deferredDepartment = useDeferredValue(department)
  const { user, isAdmin } = useAuth()
  const { data, isLoading, error } = useEmployeeList({
    search: deferredSearch || undefined,
    department: deferredDepartment || undefined,
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
      {user && <WelcomeBanner userId={user.id} role={user.role} />}
      <div className="flex gap-6">
        {/* Sticky sidebar — desktop only */}
        <aside className="hidden lg:block w-[220px] shrink-0">
          <div className="sticky top-20 space-y-1">
            <div className="flex items-center justify-between mb-5">
              <div className="space-y-1">
                <p className="eyebrow">인력 현황</p>
                <h2 className="heading-2">직원 목록</h2>
              </div>
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
            <div>
              <p className="eyebrow mb-1">인력 현황</p>
              <h1 className="heading-1">직원 목록</h1>
            </div>
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
            <EmptyState
              icon={Users}
              heading="직원을 찾을 수 없습니다"
              description="검색어나 필터 조건을 바꿔보거나, 전체 목록으로 돌아가세요."
              action={
                (search || department || selectedSkillIds.length > 0 || maxAllocationPercent) ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch('')
                      setDepartment('')
                      setSelectedSkillIds([])
                      setMaxAllocationPercent(undefined)
                      resetPage()
                    }}
                  >
                    필터 초기화
                  </Button>
                ) : undefined
              }
            />
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
