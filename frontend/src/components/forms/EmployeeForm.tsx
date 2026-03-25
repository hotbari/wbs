'use client'
import { useState } from 'react'
import { Input, Select, Button } from '@/components/ui/primitives'
import { WarningCircle } from '@phosphor-icons/react'
import { useDeactivateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
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
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false)
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateEmployee()
  const router = useRouter()

  function handleDeactivate() {
    if (initialData?.id) {
      deactivate(initialData.id, {
        onSuccess: () => {
          router.push('/employees')
        },
      })
    }
  }

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
    { label: '이름 *', name: 'fullName', type: 'text' },
    { label: '이메일 *', name: 'email', type: 'email' },
    ...(isCreate ? [{ label: '비밀번호 *', name: 'password', type: 'password' }] : []),
    { label: '전화번호', name: 'phone', type: 'text' },
    { label: '부서 *', name: 'department', type: 'text' },
    { label: '팀', name: 'team', type: 'text' },
    { label: '직함 *', name: 'jobTitle', type: 'text' },
    { label: '등급', name: 'grade', type: 'text' },
    { label: '입사일 *', name: 'hiredAt', type: 'date' },
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
        <label className="block text-sm font-medium mb-1.5">고용 형태 *</label>
        <Select value={form.employmentType} onChange={set('employmentType')}>
          <option value="FULL_TIME">정규직</option>
          <option value="CONTRACT">계약직</option>
          <option value="PART_TIME">파트타임</option>
        </Select>
      </div>
      <Button type="submit" loading={isPending}>
        저장
      </Button>
      {!isCreate && (
        <>
          {!showDeactivateConfirm ? (
            <Button variant="destructive" onClick={() => setShowDeactivateConfirm(true)}>
              직원 비활성화
            </Button>
          ) : (
            <div className="border border-destructive/30 bg-destructive/5 rounded-[var(--radius-lg)] p-4 space-y-3">
              <p className="text-sm font-medium text-destructive">비활성화 확인</p>
              <p className="text-sm text-muted-foreground">
                이 직원은 로그인이 불가능해지고 모든 배정이 해제됩니다.
                데이터는 삭제되지 않으며 관리자가 언제든 복구할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={handleDeactivate} loading={isDeactivating}>확인, 비활성화</Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDeactivateConfirm(false)}>취소</Button>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  )
}
