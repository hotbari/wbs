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
        <div className="relative mb-2 pb-10">
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              >
                <Avatar name={employee.fullName} size="xl" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 28 }}
              >
                <p className="eyebrow mb-2">
                  {employee.department} · {employee.team ?? '팀 미지정'}
                </p>
                <h1 className="display-2">{employee.fullName}</h1>
                <p className="text-muted-foreground mt-1.5">{employee.jobTitle}</p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 300, damping: 28 }}
              className="flex items-center gap-2"
            >
              <Link href={`/employees/${employee.id}/edit`}>
                <Button variant="secondary" size="sm"><PencilSimple className="h-4 w-4" />수정</Button>
              </Link>
              {isAdmin && (
                <Button variant="secondary" size="sm" loading={sharing} onClick={() => share()}>
                  <ShareNetwork className="h-4 w-4" />
                  {copiedUrl ? '복사됨!' : '링크 공유'}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Hairline divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.22, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 h-px bg-border origin-left"
          />
        </div>

        {/* 2-col info + allocation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.07, type: 'spring', stiffness: 280, damping: 28 }}
            className="space-y-4"
          >
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
          </motion.div>
        </div>

        {employeeSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
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
          </motion.div>
        )}

        {employee.assignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          >
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
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <Card>
            <CardBody className="space-y-3">
              <p className="label-section">배정 업무 ({tasks?.length ?? 0})</p>
              <EmployeeTaskList tasks={tasks ?? []} />
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}
