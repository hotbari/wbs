'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useCreateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'

export default function NewEmployeePage() {
  const { mutate, isPending, error } = useCreateEmployee()
  const router = useRouter()
  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Add Employee</h1>
        <EmployeeForm
          isCreate
          onSubmit={(data) => mutate(data, { onSuccess: (emp) => router.push(`/employees/${emp.id}`) })}
          isPending={isPending}
          serverError={(error as { response?: { data?: { errors?: { field: string; message: string }[] } } } | null)?.response?.data ?? null}
        />
      </div>
    </AdminGuard>
  )
}
