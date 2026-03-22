'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useCreateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardBody, PageTransition } from '@/components/ui/primitives'
import { ArrowLeft } from '@phosphor-icons/react'

export default function NewEmployeePage() {
  const { mutate, isPending, error } = useCreateEmployee()
  const router = useRouter()
  return (
    <AdminGuard>
      <PageTransition>
        <div className="max-w-xl mx-auto">
          <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />Back to employees
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mb-6">Add Employee</h1>
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
