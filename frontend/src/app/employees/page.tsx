'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import EmployeeCard from '@/components/ui/EmployeeCard'
import SkillFilterPanel from '@/components/ui/SkillFilterPanel'
import { Button, Input, Select, Skeleton, SkeletonCircle, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Plus, MagnifyingGlass, Users } from '@phosphor-icons/react'
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

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">직원 목록</h1>
        {isAdmin && (
          <Link href="/admin/employees/new">
            <Button><Plus className="h-4 w-4" />직원 추가</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름으로 검색..."
            value={search}
            onChange={e => { setSearch(e.target.value); resetPage() }}
            className="pl-9 w-64"
          />
        </div>
        <Input
          placeholder="부서"
          value={department}
          onChange={e => { setDepartment(e.target.value); resetPage() }}
          className="w-40"
        />
        <SkillFilterPanel
          selectedSkillIds={selectedSkillIds}
          onChange={ids => { setSelectedSkillIds(ids); resetPage() }}
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">최대 배정</label>
          <Select
            className="w-32"
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

      {error && (
        <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive mb-6">
          직원 목록을 불러오지 못했습니다.
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <EmployeeCardSkeleton key={i} />)}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState icon={Users} heading="직원을 찾을 수 없습니다" description="검색어나 필터를 조정해 보세요." />
      ) : (
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
    </PageTransition>
  )
}
