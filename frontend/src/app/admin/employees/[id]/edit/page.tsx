'use client'
import { use } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
import { Card, CardBody, Skeleton, PageTransition, PageHeader } from '@/components/ui/primitives'

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
          <PageHeader
            eyebrow="관리자"
            heading="직원 정보 수정"
            backTo={{ href: `/employees/${id}`, label: '직원 상세로' }}
          />
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
