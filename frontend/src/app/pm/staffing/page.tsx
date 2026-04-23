'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import PmGuard from '@/components/guards/PmGuard'
import { useSkillList } from '@/lib/hooks/useSkills'
import { listAvailableEmployees } from '@/lib/api/employees'
import { Card, CardBody, Button, Input, Badge, EmptyState, PageTransition } from '@/components/ui/primitives'
import { MagnifyingGlass, UsersThree } from '@phosphor-icons/react'
import type { EmployeeSummary } from '@/lib/types'

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function getDefaultToDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().split('T')[0]
}

export default function PmStaffingPage() {
  const { data: catalog = [] } = useSkillList()
  const [minPercent, setMinPercent] = useState(20)
  const [fromDate, setFromDate] = useState(getTodayString())
  const [toDate, setToDate] = useState(getDefaultToDate())
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['pm-staffing', minPercent, fromDate, toDate],
    queryFn: () => listAvailableEmployees({ minAvailablePercent: minPercent, fromDate, toDate }),
    enabled: submitted,
  })

  // Client-side skill filter
  const results = (data?.data ?? []).filter(emp =>
    selectedSkillIds.length === 0 ||
    selectedSkillIds.every(sid => emp.topSkills.some(s => s.skillId === sid))
  )

  function toggleSkill(id: string) {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function handleSearch() {
    setSubmitted(true)
    refetch()
  }

  return (
    <PmGuard>
      <PageTransition>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">인력 요청</h1>

          <Card className="max-w-2xl">
            <CardBody className="space-y-4">
              <h2 className="label-caps">조건 설정</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">최소 가용률 (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={minPercent}
                    onChange={e => setMinPercent(Number(e.target.value))}
                  />
                </div>
                <div />
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">시작일</label>
                  <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">종료일</label>
                  <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                </div>
              </div>

              {catalog.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">필요 스킬 (선택)</label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {catalog.map(skill => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                          selectedSkillIds.includes(skill.id)
                            ? 'bg-accent text-accent-foreground border-accent'
                            : 'border-border text-muted-foreground hover:border-accent'
                        }`}
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleSearch} loading={isFetching}>
                <MagnifyingGlass className="h-4 w-4" />
                가용 인력 조회
              </Button>
            </CardBody>
          </Card>

          {submitted && (
            <Card>
              <CardBody className="p-0">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-medium">
                    조회 결과 <span className="text-muted-foreground">({results.length}명)</span>
                  </h2>
                </div>
                {results.length === 0 ? (
                  <EmptyState icon={UsersThree} heading="조건에 맞는 인력이 없습니다" className="py-10" />
                ) : (
                  <div className="divide-y divide-border">
                    {results.map((emp: EmployeeSummary) => (
                      <div key={emp.id} className="px-4 py-3 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-medium">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground">{emp.jobTitle} · {emp.department}</p>
                          {emp.topSkills.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {emp.topSkills.map(s => (
                                <span key={s.skillId} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {s.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant={emp.totalAllocationPercent <= 50 ? 'success' : 'warning'}>
                          가용 {100 - emp.totalAllocationPercent}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </PageTransition>
    </PmGuard>
  )
}
