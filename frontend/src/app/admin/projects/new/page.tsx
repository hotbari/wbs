'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/guards/AdminGuard'
import { useCreateProject } from '@/lib/hooks/useProjects'

export default function NewProjectPage() {
  const router = useRouter()
  const { mutate: create, isPending, error } = useCreateProject()
  const [form, setForm] = useState({ name: '', description: '', startDate: '', endDate: '' })

  const errMsg = (error as any)?.response?.data?.message

  return (
    <AdminGuard>
      <div className="max-w-lg">
        <h1 className="text-xl font-semibold mb-6">New Project</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border rounded px-3 py-2 text-sm"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date *</label>
              <input type="date" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input type="date" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          {errMsg && <p className="text-red-500 text-sm">{errMsg}</p>}
          <button
            disabled={!form.name || !form.startDate || isPending}
            onClick={() => create(
              { name: form.name, description: form.description || undefined,
                startDate: form.startDate, endDate: form.endDate || undefined },
              { onSuccess: (p) => router.push(`/projects/${p.id}`) }
            )}
            className="bg-blue-600 text-white px-6 py-2 rounded text-sm disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create Project'}
          </button>
        </div>
      </div>
    </AdminGuard>
  )
}
