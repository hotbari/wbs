'use client'
import { useState } from 'react'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import { Input, Select, Button } from '@/components/ui/primitives'
import { WarningCircle } from '@phosphor-icons/react'
import type { Allocation } from '@/lib/types'

interface Props {
  initialData?: Allocation
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
  serverError?: string
}

export default function AllocationForm({ initialData, onSubmit, isPending, serverError }: Props) {
  const { data: employees } = useEmployeeList({ pageSize: 200 })
  const [form, setForm] = useState({
    employeeId: initialData?.employeeId ?? '',
    projectName: initialData?.projectName ?? '',
    roleInProject: initialData?.roleInProject ?? '',
    allocationPercent: initialData?.allocationPercent ?? 50,
    startDate: initialData?.startDate ?? '',
    endDate: initialData?.endDate ?? '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ ...form, endDate: form.endDate || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <p className="flex items-center gap-1.5 text-destructive text-sm">
          <WarningCircle className="h-4 w-4" weight="bold" />{serverError}
        </p>
      )}
      <div>
        <label className="block text-sm font-medium mb-1.5">직원 *</label>
        <Select value={form.employeeId}
          onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} required>
          <option value="">직원 선택</option>
          {employees?.data.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName} (할당률 {emp.totalAllocationPercent}%)
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1.5">프로젝트 이름 *</label>
          <Input value={form.projectName}
            onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">역할 *</label>
          <Input value={form.roleInProject}
            onChange={e => setForm(f => ({ ...f, roleInProject: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">할당률 % *</label>
          <Input type="number" min={1} max={100} value={form.allocationPercent}
            onChange={e => setForm(f => ({ ...f, allocationPercent: +e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">시작일 *</label>
          <Input type="date" value={form.startDate}
            onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">종료일</label>
          <Input type="date" value={form.endDate ?? ''}
            onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
        </div>
      </div>
      <Button type="submit" loading={isPending}>저장</Button>
    </form>
  )
}
