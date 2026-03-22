'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { Button, Input, Skeleton, SkeletonCircle, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
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
  const [page, setPage] = useState(1)
  const { isAdmin } = useAuth()
  const { data, isLoading, error } = useEmployeeList({
    search: search || undefined,
    department: department || undefined,
    page,
  })

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        {isAdmin && (
          <Link href="/admin/employees/new">
            <Button><Plus className="h-4 w-4" />Add Employee</Button>
          </Link>
        )}
      </div>
      <div className="flex gap-3 mb-6">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9 w-64"
          />
        </div>
        <Input
          placeholder="Department"
          value={department}
          onChange={e => { setDepartment(e.target.value); setPage(1) }}
          className="w-48"
        />
      </div>
      {error && (
        <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive mb-6">
          Failed to load employees.
        </div>
      )}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <EmployeeCardSkeleton key={i} />)}
        </div>
      ) : data?.data.length === 0 ? (
        <EmptyState icon={Users} heading="No employees found" description="Try adjusting your search or filters." />
      ) : (
        <StaggerList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {data?.data.map(emp => (
            <StaggerItem key={emp.id}><EmployeeCard employee={emp} /></StaggerItem>
          ))}
        </StaggerList>
      )}
      {data && totalPages > 1 && (
        <div className="flex items-center gap-2 mt-8 justify-center">
          <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
          <span className="text-sm text-muted-foreground px-2">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </PageTransition>
  )
}
