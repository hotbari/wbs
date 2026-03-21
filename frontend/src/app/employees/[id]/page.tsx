'use client'
import { useEmployee } from '@/lib/hooks/useEmployees'
import SkillBadge from '@/components/ui/SkillBadge'
import AllocationBar from '@/components/ui/AllocationBar'
import Link from 'next/link'
import { use } from 'react'
import type { EmployeeSkill, Allocation, Proficiency } from '@/lib/types'

// In Next.js 15+, params is a Promise
export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee, isLoading } = useEmployee(id)

  if (isLoading) return <p className="text-gray-500">Loading...</p>
  if (!employee) return <p className="text-red-500">Employee not found.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold">{employee.fullName}</h1>
          <p className="text-gray-500">{employee.jobTitle} · {employee.department}</p>
        </div>
        <Link href={`/employees/${employee.id}/edit`}
          className="text-sm text-blue-600 border border-blue-600 rounded px-3 py-1 hover:bg-blue-50">
          Edit Profile
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-4 space-y-2">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">Details</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-gray-500">Email:</span> {employee.email}</div>
          {employee.phone && <div><span className="text-gray-500">Phone:</span> {employee.phone}</div>}
          <div><span className="text-gray-500">Team:</span> {employee.team ?? '—'}</div>
          <div><span className="text-gray-500">Grade:</span> {employee.grade ?? '—'}</div>
          <div><span className="text-gray-500">Type:</span> {employee.employmentType}</div>
          <div><span className="text-gray-500">Hired:</span> {employee.hiredAt}</div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">
          Allocation ({employee.totalAllocationPercent}%)
        </h2>
        <AllocationBar percent={employee.totalAllocationPercent} />
      </div>

      {employee.skills.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {employee.skills.map((es: EmployeeSkill) => (
              <SkillBadge key={es.id} name={es.skillId} proficiency={es.proficiency as Proficiency} />
            ))}
          </div>
        </div>
      )}

      {employee.assignments.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">Assignments</h2>
          <div className="space-y-2">
            {employee.assignments.map((a: Allocation) => (
              <div key={a.id} className="flex justify-between text-sm border rounded p-2">
                <div>
                  <p className="font-medium">{a.projectName}</p>
                  <p className="text-gray-500">{a.roleInProject}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{a.allocationPercent}%</p>
                  <p className="text-xs text-gray-400">{a.startDate} – {a.endDate ?? 'ongoing'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
