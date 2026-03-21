'use client'
import { use } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import EmployeeForm from '@/components/forms/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'

export default function AdminEditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee, isLoading } = useEmployee(id)
  const { mutate, isPending, error } = useUpdateEmployee(id)
  const router = useRouter()

  if (isLoading || !employee) return <p className="text-gray-500">Loading...</p>

  return (
    <AdminGuard>
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Edit Employee</h1>
        <EmployeeForm
          initialData={employee}
          isCreate={false}
          onSubmit={(data) => mutate(data, { onSuccess: () => router.push(`/employees/${id}`) })}
          isPending={isPending}
          serverError={(error as { response?: { data?: { errors?: { field: string; message: string }[] } } } | null)?.response?.data ?? null}
        />
      </div>
    </AdminGuard>
  )
}
