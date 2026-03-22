'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { Card, CardBody, ProgressBar, Skeleton, EmptyState, PageTransition, StaggerList, StaggerItem } from '@/components/ui/primitives'
import { Users, ChartBar, UserCircle, TrendUp } from '@phosphor-icons/react'

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardBody><Skeleton className="h-4 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardBody></Card>)}
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
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          {isLoading ? <DashboardSkeleton /> : data ? (
            <>
              <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StaggerItem>
                  <Card><CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-accent" weight="duotone" />
                      <span className="text-sm text-muted-foreground">Active Employees</span>
                    </div>
                    <p className="text-3xl font-bold">{data.totalActiveEmployees}</p>
                  </CardBody></Card>
                </StaggerItem>
                <StaggerItem>
                  <Card><CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <ChartBar className="h-4 w-4 text-accent" weight="duotone" />
                      <span className="text-sm text-muted-foreground">Avg Allocation</span>
                    </div>
                    <p className="text-3xl font-bold mb-2">{Math.round(data.avgAllocationPercent)}%</p>
                    <ProgressBar value={data.avgAllocationPercent} />
                  </CardBody></Card>
                </StaggerItem>
                <StaggerItem>
                  <Card><CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <UserCircle className="h-4 w-4 text-accent" weight="duotone" />
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <p className="text-3xl font-bold">{data.availableEmployees.length}</p>
                  </CardBody></Card>
                </StaggerItem>
                <StaggerItem>
                  <Card><CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendUp className="h-4 w-4 text-warning" weight="duotone" />
                      <span className="text-sm text-muted-foreground">Over-allocated</span>
                    </div>
                    <p className="text-3xl font-bold">{data.topOverAllocated.length}</p>
                  </CardBody></Card>
                </StaggerItem>
              </StaggerList>

              <Card>
                <CardBody>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Available (next 30 days)</h2>
                  {data.availableEmployees.length === 0 ? (
                    <EmptyState icon={Users} heading="No available employees" className="py-6" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {data.availableEmployees.map(e => <EmployeeCard key={e.id} employee={e} />)}
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">Most Allocated</h2>
                  <div className="space-y-2">
                    {data.topOverAllocated.map(({ employee, allocationPercent }) => (
                      <div key={employee.id} className="flex items-center gap-4 border border-border rounded-[var(--radius-lg)] p-3">
                        <span className="text-sm font-medium w-40 truncate">{employee.fullName}</span>
                        <div className="flex-1"><ProgressBar value={allocationPercent} /></div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{allocationPercent}%</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </>
          ) : null}
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
