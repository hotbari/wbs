'use client'
import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui/primitives'
import { WarningCircle } from '@phosphor-icons/react'
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

  function FieldError({ field }: { field: string }) {
    const msg = fieldError(field)
    if (!msg) return null
    return (
      <p className="flex items-center gap-1 text-destructive text-xs mt-1">
        <WarningCircle className="h-3 w-3" weight="bold" />{msg}
      </p>
    )
  }

  const fields = [
    { label: 'Full Name *', name: 'fullName', type: 'text' },
    { label: 'Email *', name: 'email', type: 'email' },
    ...(isCreate ? [{ label: 'Password *', name: 'password', type: 'password' }] : []),
    { label: 'Phone', name: 'phone', type: 'text' },
    { label: 'Department *', name: 'department', type: 'text' },
    { label: 'Team', name: 'team', type: 'text' },
    { label: 'Job Title *', name: 'jobTitle', type: 'text' },
    { label: 'Grade', name: 'grade', type: 'text' },
    { label: 'Hired At *', name: 'hiredAt', type: 'date' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ label, name, type }) => (
          <div key={name} className={name === 'email' || name === 'fullName' ? 'col-span-2' : ''}>
            <label className="block text-sm font-medium mb-1.5">{label}</label>
            <Input
              type={type}
              value={(form as Record<string, string>)[name]}
              onChange={set(name)}
              error={!!fieldError(name)}
            />
            <FieldError field={name} />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Employment Type *</label>
        <Select value={form.employmentType} onChange={set('employmentType')}>
          <option value="FULL_TIME">Full Time</option>
          <option value="CONTRACT">Contract</option>
          <option value="PART_TIME">Part Time</option>
        </Select>
      </div>
      <Button type="submit" loading={isPending}>
        Save
      </Button>
    </form>
  )
}
