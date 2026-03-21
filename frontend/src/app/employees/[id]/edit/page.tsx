'use client'
import { use, useState, useEffect } from 'react'
import { useEmployee, useUpdateEmployee } from '@/lib/hooks/useEmployees'
import { useRouter } from 'next/navigation'

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: employee } = useEmployee(id)
  const { mutateAsync: updateEmployee, isPending } = useUpdateEmployee(id)
  const router = useRouter()

  const [form, setForm] = useState({
    phone: '',
    team: '',
    grade: '',
  })

  useEffect(() => {
    if (employee) {
      setForm({
        phone: employee.phone ?? '',
        team: employee.team ?? '',
        grade: employee.grade ?? '',
      })
    }
  }, [employee])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body: Record<string, unknown> = {}
    if (form.phone) body.phone = form.phone
    if (form.team) body.team = form.team
    if (form.grade) body.grade = form.grade
    await updateEmployee(body)
    router.push(`/employees/${id}`)
  }

  if (!employee) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full border rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
          <input type="text" value={form.team}
            onChange={e => setForm(f => ({ ...f, team: e.target.value }))}
            className="w-full border rounded p-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
          <input type="text" value={form.grade}
            onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
            className="w-full border rounded p-2 text-sm" />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">
            {isPending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="border px-4 py-2 rounded text-sm text-gray-600">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
