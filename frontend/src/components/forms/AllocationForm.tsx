'use client'
import { useState } from 'react'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
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
      {serverError && <p className="text-red-500 text-sm">{serverError}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Employee *</label>
        <select value={form.employeeId}
          onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required>
          <option value="">Select employee</option>
          {employees?.data.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.fullName} ({emp.totalAllocationPercent}% allocated)
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Project Name *</label>
        <input value={form.projectName}
          onChange={e => setForm(f => ({ ...f, projectName: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Role *</label>
        <input value={form.roleInProject}
          onChange={e => setForm(f => ({ ...f, roleInProject: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Allocation % *</label>
        <input type="number" min={1} max={100} value={form.allocationPercent}
          onChange={e => setForm(f => ({ ...f, allocationPercent: +e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Start Date *</label>
        <input type="date" value={form.startDate}
          onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
          className="w-full border rounded p-2 text-sm" required />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Date (leave blank = ongoing)</label>
        <input type="date" value={form.endDate ?? ''}
          onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
          className="w-full border rounded p-2 text-sm" />
      </div>
      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
