'use client'
import { useEmployee } from '@/lib/hooks/useEmployees'
import SkillBadge from '@/components/ui/SkillBadge'
import Link from 'next/link'
import { use } from 'react'
import type { EmployeeSkill, Allocation, Proficiency } from '@/lib/types'
import { Avatar, Button, Card, CardBody, ProgressBar, Skeleton, SkeletonCircle, SkeletonText, PageTransition } from '@/components/ui/primitives'
import { PencilSimple } from '@phosphor-icons/react'

function DetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4"><SkeletonCircle className="h-14 w-14" /><div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div></div>
      <Card><CardBody className="space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardBody></Card>
    </div>
  )
}

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee, isLoading } = useEmployee(id)

  if (isLoading) return <DetailSkeleton />
  if (!employee) return (
    <div className="border border-destructive/30 bg-destructive-light rounded-[var(--radius-lg)] px-4 py-3 text-sm text-destructive">
      Employee not found.
    </div>
  )

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar name={employee.fullName} size="lg" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{employee.fullName}</h1>
              <p className="text-muted-foreground">{employee.jobTitle} · {employee.department}</p>
            </div>
          </div>
          <Link href={`/employees/${employee.id}/edit`}>
            <Button variant="secondary" size="sm"><PencilSimple className="h-4 w-4" />Edit</Button>
          </Link>
        </div>

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Details</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div><span className="text-muted-foreground">Email:</span> {employee.email}</div>
              {employee.phone && <div><span className="text-muted-foreground">Phone:</span> {employee.phone}</div>}
              <div><span className="text-muted-foreground">Team:</span> {employee.team ?? '—'}</div>
              <div><span className="text-muted-foreground">Grade:</span> {employee.grade ?? '—'}</div>
              <div><span className="text-muted-foreground">Type:</span> {employee.employmentType}</div>
              <div><span className="text-muted-foreground">Hired:</span> {employee.hiredAt}</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Allocation ({employee.totalAllocationPercent}%)
            </h2>
            <ProgressBar value={employee.totalAllocationPercent} />
          </CardBody>
        </Card>

        {employee.skills.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((es: EmployeeSkill) => (
                  <SkillBadge key={es.id} name={es.skillId} proficiency={es.proficiency as Proficiency} />
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {employee.assignments.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assignments</h2>
              <div className="space-y-2">
                {employee.assignments.map((a: Allocation) => (
                  <div key={a.id} className="flex justify-between text-sm border border-border rounded-[var(--radius-lg)] p-3">
                    <div>
                      <p className="font-medium">{a.projectName}</p>
                      <p className="text-muted-foreground">{a.roleInProject}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{a.allocationPercent}%</p>
                      <p className="text-xs text-muted-foreground">{a.startDate} – {a.endDate ?? 'ongoing'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </PageTransition>
  )
}
