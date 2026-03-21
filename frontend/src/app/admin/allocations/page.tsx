'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import AllocationForm from '@/components/forms/AllocationForm'
import { useAllocations, useCreateAllocation, useDeactivateAllocation } from '@/lib/hooks/useAllocations'
import { useState } from 'react'

export default function AllocationsPage() {
  const { data } = useAllocations({ isActive: true })
  const { mutate: create, isPending, error: createError } = useCreateAllocation()
  const { mutate: deactivate } = useDeactivateAllocation()
  const [showForm, setShowForm] = useState(false)

  const conflictMsg = (createError as { response?: { data?: { message?: string } } } | null)?.response?.data?.message

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Allocations</h1>
          <button onClick={() => setShowForm(s => !s)}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            {showForm ? 'Cancel' : 'Add Allocation'}
          </button>
        </div>
        {showForm && (
          <div className="border rounded-lg p-4 max-w-lg">
            <AllocationForm
              onSubmit={(data) => create(data, { onSuccess: () => setShowForm(false) })}
              isPending={isPending}
              serverError={conflictMsg}
            />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-2 pr-4">Employee ID</th>
                <th className="py-2 pr-4">Project</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">%</th>
                <th className="py-2 pr-4">Start</th>
                <th className="py-2 pr-4">End</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map(a => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 text-xs text-gray-400">{a.employeeId.slice(0, 8)}…</td>
                  <td className="py-2 pr-4">{a.projectName}</td>
                  <td className="py-2 pr-4 text-gray-600">{a.roleInProject}</td>
                  <td className="py-2 pr-4 font-medium">{a.allocationPercent}%</td>
                  <td className="py-2 pr-4">{a.startDate}</td>
                  <td className="py-2 pr-4">{a.endDate ?? 'Ongoing'}</td>
                  <td className="py-2">
                    <button onClick={() => deactivate(a.id)}
                      className="text-red-500 text-xs hover:underline">Deactivate</button>
                  </td>
                </tr>
              ))}
              {(!data || data.data.length === 0) && (
                <tr><td colSpan={7} className="py-4 text-center text-gray-400">No active allocations.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  )
}
