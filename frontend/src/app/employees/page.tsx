'use client'
import { useState } from 'react'
import EmployeeCard from '@/components/ui/EmployeeCard'
import { useEmployeeList } from '@/lib/hooks/useEmployees'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

export default function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [page, setPage] = useState(1)
  const { isAdmin } = useAuth()
  const { data, isLoading, error } = useEmployeeList({
    search: search || undefined,
    department: department || undefined,
    page,
  })

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        {isAdmin && (
          <Link href="/admin/employees/new"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700">
            + Add Employee
          </Link>
        )}
      </div>
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="border rounded p-2 text-sm w-64"
        />
        <input
          placeholder="Department"
          value={department}
          onChange={e => { setDepartment(e.target.value); setPage(1) }}
          className="border rounded p-2 text-sm w-48"
        />
      </div>
      {error && <p className="text-red-500 text-sm">Failed to load employees.</p>}
      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
          {data?.data.length === 0 && <p className="text-gray-400 col-span-3">No employees found.</p>}
        </div>
      )}
      {data && totalPages > 1 && (
        <div className="flex gap-2 mt-6 justify-center">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm py-1">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  )
}
