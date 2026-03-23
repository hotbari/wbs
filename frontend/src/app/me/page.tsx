'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEmployee } from '@/lib/hooks/useEmployees'
import { useEmployeeTasks } from '@/lib/hooks/useEmployeeTasks'
import EmployeeTaskList from '@/components/ui/EmployeeTaskList'
import SkillBadge from '@/components/ui/SkillBadge'
import type { EmployeeSkill, Proficiency } from '@/lib/types'
import { Avatar, Card, CardBody, Button, Input, ProgressBar, Skeleton, SkeletonCircle, PageTransition } from '@/components/ui/primitives'
import { useState } from 'react'

function MePageSkeleton() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-4"><SkeletonCircle className="h-14 w-14" /><div className="space-y-2"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div></div>
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="w-56 space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
    </div>
  )
}

export default function MePage() {
  const { user } = useAuth()
  const { data: employee, isLoading } = useEmployee(user?.employeeId ?? '')
  const { data: tasks } = useEmployeeTasks(user?.employeeId ?? '')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  if (isLoading || !employee) return <MePageSkeleton />

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar name={employee.fullName} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{employee.fullName}</h1>
            <p className="text-muted-foreground">{employee.jobTitle} · {employee.team ?? employee.department}</p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            <Card>
              <CardBody className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  내 업무 ({tasks?.length ?? 0})
                </h2>
                <EmployeeTaskList tasks={tasks ?? []} />
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-3">
                <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">계정 설정</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">이메일</label>
                    <Input value={employee.email} disabled className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">비밀번호</label>
                    {showPasswordForm ? (
                      <div className="space-y-2 mt-1">
                        <Input type="password" placeholder="현재 비밀번호" />
                        <Input type="password" placeholder="새 비밀번호" />
                        <div className="flex gap-2">
                          <Button size="sm">변경</Button>
                          <Button variant="ghost" size="sm" onClick={() => setShowPasswordForm(false)}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <Input value="••••••••" disabled className="flex-1" />
                        <Button variant="secondary" size="sm" onClick={() => setShowPasswordForm(true)}>변경</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="w-56 shrink-0 space-y-4">
            <Card>
              <CardBody className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">할당률</h3>
                <p className="text-3xl font-bold">{employee.totalAllocationPercent}%</p>
                <ProgressBar value={employee.totalAllocationPercent} />
                {employee.assignments.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {employee.assignments.filter(a => a.isActive).map(a => (
                      <div key={a.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate">{a.projectName}</span>
                        <span>{a.allocationPercent}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">상세 정보</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">부서</span><span>{employee.department}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">팀</span><span>{employee.team ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">등급</span><span>{employee.grade ?? '—'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">유형</span><span>{employee.employmentType === 'FULL_TIME' ? '정규직' : employee.employmentType === 'CONTRACT' ? '계약직' : '파트타임'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">입사일</span><span>{employee.hiredAt}</span></div>
                </div>
              </CardBody>
            </Card>

            {employee.skills.length > 0 && (
              <Card>
                <CardBody className="space-y-2">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">스킬</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {employee.skills.map((es: EmployeeSkill) => (
                      <SkillBadge key={es.id} name={es.skillId} proficiency={es.proficiency as Proficiency} />
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
