import Link from 'next/link'
import AllocationBar from './AllocationBar'
import type { EmployeeSummary } from '@/lib/types'

export default function EmployeeCard({ employee }: { employee: EmployeeSummary }) {
  return (
    <Link href={`/employees/${employee.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700 shrink-0">
            {employee.fullName[0]}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{employee.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{employee.jobTitle} · {employee.department}</p>
          </div>
        </div>
        <AllocationBar percent={employee.totalAllocationPercent} />
        <p className="text-xs text-gray-400 mt-1">{employee.totalAllocationPercent}% allocated</p>
      </div>
    </Link>
  )
}
