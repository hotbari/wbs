'use client'
import { useState } from 'react'
import type { EmployeeDetail } from '@/lib/types'

interface Props {
  initialData?: EmployeeDetail
  isCreate?: boolean
  onSubmit: (data: Record<string, unknown>) => void
  isPending: boolean
  serverError?: { errors?: { field: string; message: string }[] } | null
}

export default function EmployeeForm({ initialData, isCreate = false, onSubmit, isPending, serverError }: Props) {
  const [form, setForm] = useState({
    fullName: initialData?.fullName ?? '',
    email: initialData?.email ?? '',
    password: '',
    phone: initialData?.phone ?? '',
    department: initialData?.department ?? '',
    team: initialData?.team ?? '',
    jobTitle: initialData?.jobTitle ?? '',
    grade: initialData?.grade ?? '',
    employmentType: (initialData?.employmentType ?? 'FULL_TIME') as string,
    hiredAt: initialData?.hiredAt ?? '',
  })

  function set(key: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload: Record<string, unknown> = { ...form }
    if (!isCreate) delete payload.password
    onSubmit(payload)
  }

  function fieldError(field: string) {
    return serverError?.errors?.find(e => e.field === field)?.message
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {[
        { label: 'Full Name *', name: 'fullName', type: 'text' },
        { label: 'Email *', name: 'email', type: 'email' },
        ...(isCreate ? [{ label: 'Password *', name: 'password', type: 'password' }] : []),
        { label: 'Phone', name: 'phone', type: 'text' },
        { label: 'Department *', name: 'department', type: 'text' },
        { label: 'Team', name: 'team', type: 'text' },
        { label: 'Job Title *', name: 'jobTitle', type: 'text' },
        { label: 'Grade', name: 'grade', type: 'text' },
        { label: 'Hired At *', name: 'hiredAt', type: 'date' },
      ].map(({ label, name, type }) => (
        <div key={name}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input
            type={type}
            value={(form as Record<string, string>)[name]}
            onChange={set(name)}
            className="w-full border rounded p-2 text-sm"
          />
          {fieldError(name) && <p className="text-red-500 text-xs mt-1">{fieldError(name)}</p>}
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium mb-1">Employment Type *</label>
        <select value={form.employmentType} onChange={set('employmentType')}
          className="w-full border rounded p-2 text-sm">
          <option value="FULL_TIME">Full Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="PART_TIME">Part Time</option>
        </select>
      </div>
      <button type="submit" disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
