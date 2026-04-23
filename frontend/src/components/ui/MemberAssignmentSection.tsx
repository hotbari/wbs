'use client'
import { useState } from 'react'
import { useEmployeeList, useEmployee } from '@/lib/hooks/useEmployees'
import { useAllocations, useCreateAllocation } from '@/lib/hooks/useAllocations'
import { updateAllocation } from '@/lib/api/allocations'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EmployeeSummary } from '@/lib/types'
import { Avatar, Button, Card, CardBody, Input, EmptyState } from '@/components/ui/primitives'
import { MagnifyingGlass, Plus, Trash, UsersThree } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'framer-motion'
import SkillBadge from '@/components/ui/SkillBadge'
import type { Proficiency } from '@/lib/types'

function allocationColor(percent: number): string {
  if (percent <= 30) return 'text-allocation-low'
  if (percent <= 69) return 'text-allocation-medium'
  if (percent <= 99) return 'text-allocation-high'
  return 'text-destructive'
}

function allocationBarColor(percent: number): string {
  if (percent <= 30) return 'bg-allocation-low'
  if (percent <= 69) return 'bg-allocation-medium'
  if (percent <= 99) return 'bg-allocation-high'
  return 'bg-destructive'
}

interface AddFormState {
  employeeId: string
  employeeName: string
  role: string
  percent: string
}

interface Props {
  projectId: string
  projectName: string
}

function findEmployeeName(employeeId: string, employees: EmployeeSummary[]): string {
  return employees.find(e => e.id === employeeId)?.fullName ?? employeeId
}

export default function MemberAssignmentSection({ projectId, projectName }: Props) {
  const [search, setSearch] = useState('')
  const [addForm, setAddForm] = useState<AddFormState | null>(null)
  const [expandedEmpId, setExpandedEmpId] = useState<string | null>(null)
  const qc = useQueryClient()

  const { data: allAllocations } = useAllocations({ isActive: true })
  const { data: employees } = useEmployeeList({ pageSize: 100 })
  const { mutate: createAllocation, isPending: isCreating } = useCreateAllocation()

  const { mutate: deactivateMember } = useMutation({
    mutationFn: (id: string) => updateAllocation(id, { isActive: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['allocations'] }),
  })

  const { data: expandedEmployee } = useEmployee(expandedEmpId ?? '')

  const allEmployees = employees?.data ?? []

  const currentMembers = allAllocations?.data?.filter(
    a => a.projectId === projectId && a.isActive
  ) ?? []

  const currentMemberIds = new Set(currentMembers.map(a => a.employeeId))

  const availableEmployees = allEmployees.filter(emp => {
    if (currentMemberIds.has(emp.id)) return false
    if (search) {
      const q = search.trim().toLowerCase()
      return emp.fullName.toLowerCase().includes(q) ||
        emp.jobTitle.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
    }
    return true
  })

  function handleAdd() {
    if (!addForm || !addForm.role) return
    createAllocation({
      employeeId: addForm.employeeId,
      projectName,
      projectId,
      roleInProject: addForm.role,
      allocationPercent: Math.min(100, Math.max(0, parseInt(addForm.percent) || 0)),
      startDate: new Date().toISOString().slice(0, 10),
    }, { onSuccess: () => setAddForm(null) })
  }

  return (
    <div>
      <h2 className="label-section uppercase tracking-wider font-semibold mb-3">멤버 배정</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">현재 멤버 ({currentMembers.length})</p>
          {currentMembers.length === 0 ? (
            <EmptyState icon={UsersThree} heading="배정된 멤버가 없습니다" className="py-6" />
          ) : (
            <div className="space-y-2">
              {currentMembers.map(a => (
                <Card key={a.id}>
                  <CardBody className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={findEmployeeName(a.employeeId, allEmployees)} size="sm" />
                      <div>
                        <p className="text-sm font-medium">{findEmployeeName(a.employeeId, allEmployees)}</p>
                        <p className="text-xs text-muted-foreground">{a.roleInProject} · <span className="numeric">{a.allocationPercent}%</span></p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deactivateMember(a.id)}>
                      <Trash className="h-3.5 w-3.5" />제거
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">멤버 추가</p>
          <div className="relative mb-3">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="직원 검색..."
              className="pl-9"
            />
          </div>

          {addForm && (
            <Card className="mb-3 border-accent/30">
              <CardBody className="space-y-2 py-3">
                <p className="text-sm font-medium">{addForm.employeeName} 배정</p>
                <Input placeholder="역할 *" value={addForm.role}
                  onChange={e => setAddForm(f => f ? { ...f, role: e.target.value } : f)} />
                <Input type="number" placeholder="할당률 %" value={addForm.percent}
                  min={0} max={100}
                  onChange={e => setAddForm(f => f ? { ...f, percent: e.target.value } : f)} />
                <div className="flex gap-2">
                  <Button size="sm" disabled={!addForm.role} loading={isCreating} onClick={handleAdd}>확인</Button>
                  <Button variant="ghost" size="sm" onClick={() => setAddForm(null)}>취소</Button>
                </div>
              </CardBody>
            </Card>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {availableEmployees.map(emp => {
              const isFull = emp.totalAllocationPercent >= 100
              const isExpanded = expandedEmpId === emp.id && expandedEmployee
              return (
                <Card key={emp.id} className={isFull ? 'opacity-50' : ''}>
                  <CardBody className="py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 cursor-pointer"
                        onClick={() => setExpandedEmpId(prev => prev === emp.id ? null : emp.id)}>
                        <Avatar name={emp.fullName} size="sm" />
                        <div>
                          <p className="text-sm font-medium">{emp.fullName}</p>
                          <p className="text-xs text-muted-foreground">{emp.jobTitle} · {emp.team ?? emp.department}</p>
                        </div>
                      </div>
                      <Button size="sm" disabled={isFull}
                        onClick={() => setAddForm({
                          employeeId: emp.id,
                          employeeName: emp.fullName,
                          role: '',
                          percent: '0',
                        })}>
                        <Plus className="h-3 w-3" />추가
                      </Button>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                        <span>할당률</span>
                        <span className={`numeric ${allocationColor(emp.totalAllocationPercent)}`}>{emp.totalAllocationPercent}%</span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full w-full rounded-full ${allocationBarColor(emp.totalAllocationPercent)}`}
                          style={{
                            transform: `scaleX(${Math.min(emp.totalAllocationPercent, 100) / 100})`,
                            transformOrigin: 'left',
                            transition: 'transform 700ms ease-out',
                          }} />
                      </div>
                    </div>
                    <AnimatePresence>
                      {isExpanded && expandedEmployee && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                          className="space-y-1.5 pt-1 border-t border-border overflow-hidden"
                        >
                          {expandedEmployee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {expandedEmployee.skills.map(s => (
                                <SkillBadge key={s.id} name={s.skillId} proficiency={s.proficiency as Proficiency} />
                              ))}
                            </div>
                          )}
                          {expandedEmployee.assignments.filter(a => a.isActive).length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {expandedEmployee.assignments.filter(a => a.isActive).map(a => (
                                <span key={a.id} className="mr-2">{a.projectName} (<span className="numeric">{a.allocationPercent}%</span>)</span>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardBody>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
