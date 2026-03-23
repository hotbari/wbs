'use client'
import { use } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, Skeleton, PageTransition } from '@/components/ui/primitives'
import { ArrowLeft } from '@phosphor-icons/react'

export default function AdminEditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee, isLoading } = useEmployee(id)
  const { mutate, isPending, error } = useUpdateEmployee(id)
  const router = useRouter()

  if (isLoading || !employee) return (
    <div className="max-w-xl mx-auto space-y-4">
      <Skeleton className="h-4 w-32" /><Skeleton className="h-8 w-48 mt-4" /><Skeleton className="h-64 w-full mt-6" />
    </div>
  )

  return (
    <AdminGuard>
      <PageTransition>
        <div className="max-w-xl mx-auto">
          <Link href={`/employees/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />프로필로 돌아가기
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">직원 정보 수정</h1>
          <Card>
            <CardBody>
              <EmployeeForm
                initialData={employee}
                isCreate={false}
                onSubmit={(data) => mutate(data, { onSuccess: () => router.push(`/employees/${id}`) })}
                isPending={isPending}
                serverError={(error as { response?: { data?: { errors?: { field: string; message: string }[] } } } | null)?.response?.data ?? null}
              />
            </CardBody>
          </Card>
        </div>
      </PageTransition>
    </AdminGuard>
  )
}
