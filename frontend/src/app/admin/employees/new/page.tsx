'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useCreateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
import { Card, CardBody, PageTransition, PageHeader } from '@/components/ui/primitives'

export default function NewEmployeePage() {
  const { mutate, isPending, error } = useCreateEmployee()
  const router = useRouter()
  return (
    <AdminGuard>
      <PageTransition>
        <div className="max-w-xl mx-auto">
          <PageHeader
            eyebrow="관리자"
            heading="직원 추가"
            backTo={{ href: '/employees', label: '직원 목록으로' }}
          />
          <Card>
            <CardBody>
              <EmployeeForm
                isCreate
                onSubmit={(data) => mutate(data, { onSuccess: (emp) => router.push(`/employees/${emp.id}`) })}
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
