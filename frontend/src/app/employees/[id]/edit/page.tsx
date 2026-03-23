'use client'
import { use, useState, useEffect } from 'react'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, Input, Button, Skeleton, PageTransition } from '@/components/ui/primitives'
import { ArrowLeft } from '@phosphor-icons/react'

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee } = useEmployee(id)
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee(id)
  const router = useRouter()

  const [form, setForm] = useState({ phone: '', team: '', grade: '' })

  useEffect(() => {
    if (employee) {
      setForm({ phone: employee.phone ?? '', team: employee.team ?? '', grade: employee.grade ?? '' })
    }
  }, [employee])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body: Record<string, unknown> = {}
    if (form.phone) body.phone = form.phone
    if (form.team) body.team = form.team
    if (form.grade) body.grade = form.grade
    await updateEmployee(body)
    router.push(`/employees/${id}`)
  }

  if (!employee) return (
    <div className="max-w-md mx-auto space-y-4">
      <Skeleton className="h-8 w-32" /><Skeleton className="h-64 w-full" />
    </div>
  )

  return (
    <PageTransition>
      <div className="max-w-md mx-auto">
        <Link href={`/employees/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />프로필로 돌아가기
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight mb-6">프로필 수정</h1>
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">전화번호</label>
                <Input type="text" value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">팀</label>
                <Input type="text" value={form.team}
                  onChange={e => setForm(f => ({ ...f, team: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">등급</label>
                <Input type="text" value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" loading={isPending}>저장</Button>
                <Button type="button" variant="ghost" onClick={() => router.back()}>취소</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </PageTransition>
  )
}
