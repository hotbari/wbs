'use client'
import AdminGuard from '@/components/guards/AdminGuard'
import AllocationBar from '@/components/ui/AllocationBar'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useDashboard } from '@/lib/hooks/useDashboard'

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  return (
    <AdminGuard>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Active Employees</p>
                <p className="text-3xl font-bold">{data.totalActiveEmployees}</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Avg Allocation</p>
                <p className="text-3xl font-bold">{Math.round(data.avgAllocationPercent)}%</p>
                <AllocationBar percent={data.avgAllocationPercent} />
              </div>
            </div>

            <section>
              <h2 className="font-medium mb-3">Available (next 30 days)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.availableEmployees.map(e => <EmployeeCard key={e.id} employee={e} />)}
                {data.availableEmployees.length === 0 && (
                  <p className="text-gray-400 col-span-3">No available employees found.</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="font-medium mb-3">Most Allocated</h2>
              <div className="space-y-2">
                {data.topOverAllocated.map(({ employee, allocationPercent }) => (
                  <div key={employee.id} className="flex items-center gap-4 border rounded p-3">
                    <span className="text-sm font-medium w-40 truncate">{employee.fullName}</span>
                    <div className="flex-1"><AllocationBar percent={allocationPercent} /></div>
                    <span className="text-sm text-gray-500 w-12 text-right">{allocationPercent}%</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AdminGuard>
  )
}
