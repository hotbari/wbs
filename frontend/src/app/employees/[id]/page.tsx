'use client'
import { useEmployee } from '@/lib/hooks/useEmployees'
import { useEmployeeTasks } from '@/lib/hooks/useEmployeeTasks'
import SkillBadge from '@/components/ui/SkillBadge'
import SkillFreshnessBadge from '@/components/ui/SkillFreshnessBadge'
import EmployeeTaskList from '@/components/ui/EmployeeTaskList'
import Link from 'next/link'
import { use, useState, useRef, useEffect } from 'react'
import type { EmployeeSkill, Allocation, Proficiency, AvailabilityPeriod } from '@/lib/types'
import { Avatar, Button, Card, CardBody, ProgressBar, Skeleton, SkeletonCircle, SkeletonText, PageTransition } from '@/components/ui/primitives'
import { PencilSimple, ShareNetwork } from '@phosphor-icons/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createShareLink } from '@/lib/api/share'
import { getEmployeeAvailability, listEmployeeSkills } from '@/lib/api/employees'
import { useSkillList } from '@/lib/hooks/useSkills'

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
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Avatar name={employee.fullName} size="lg" />
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{employee.fullName}</h1>
              <p className="text-muted-foreground">{employee.jobTitle} · {employee.department}</p>
            </div>
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

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">상세 정보</h2>
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

        <Card>
          <CardBody className="space-y-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              할당률 ({employee.totalAllocationPercent}%)
            </h2>
            <ProgressBar value={employee.totalAllocationPercent} />
          </CardBody>
        </Card>

        {availability && availability.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                향후 가용 예측
              </h2>
              <div className="space-y-2">
                {availability.map((period: AvailabilityPeriod, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {period.from}
                      {period.to ? ` ~ ${period.to}` : ' 이후'}
                    </span>
                    <span className={`font-medium ${
                      period.availablePercent >= 50 ? 'text-accent' :
                      period.availablePercent > 0   ? 'text-warning' :
                      'text-destructive'
                    }`}>
                      {period.availablePercent}% 가용
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {employeeSkills.length > 0 && (
          <Card>
            <CardBody className="space-y-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">스킬</h2>
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
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">프로젝트 배정</h2>
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
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              배정 업무 ({tasks?.length ?? 0})
            </h2>
            <EmployeeTaskList tasks={tasks ?? []} />
          </CardBody>
        </Card>
      </div>
    </PageTransition>
  )
}
