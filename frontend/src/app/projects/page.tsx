'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useProjectList, useArchiveProject } from '@/lib/hooks/useProjects'
import type { ProjectStatus } from '@/lib/types'

export default function ProjectsPage() {
  const [status, setStatus] = useState<ProjectStatus | undefined>()
  const { data } = useProjectList({ status })
  const { mutate: archive } = useArchiveProject()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Projects</h1>
        <div className="flex gap-2 items-center">
          <select
            value={status ?? ''}
            onChange={e => setStatus((e.target.value as ProjectStatus) || undefined)}
            className="border rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <Link href="/admin/projects/new" className="bg-blue-600 text-white px-4 py-2 rounded text-sm">
            New Project
          </Link>
        </div>
      </div>
      <div className="grid gap-4">
        {data?.data.map(p => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="border rounded-lg p-4 hover:bg-gray-50 flex justify-between items-center"
          >
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-gray-500">{p.phaseCount} phases · {p.taskCount} tasks</p>
              <p className="text-xs text-gray-400">{p.startDate}{p.endDate ? ` → ${p.endDate}` : ''}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
              p.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-500'
            }`}>{p.status}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
