'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { useProject } from '@/lib/hooks/useProjects'
import PhaseAccordion from '@/components/ui/PhaseAccordion'
import TaskDetailDrawer from '@/components/ui/TaskDetailDrawer'
import type { TaskItem } from '@/lib/types'

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: project, isLoading } = useProject(id)
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)

  if (isLoading) return <p className="text-gray-400">Loading…</p>
  if (!project) return <p className="text-red-500">Project not found</p>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{project.name}</h1>
          {project.description && <p className="text-sm text-gray-500 mt-1">{project.description}</p>}
          <p className="text-xs text-gray-400">{project.startDate}{project.endDate ? ` → ${project.endDate}` : ''}</p>
        </div>
        <Link href={`/admin/projects/${id}/edit`} className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50">
          Edit
        </Link>
      </div>

      <div>
        {project.phases.length === 0 ? (
          <p className="text-gray-400 italic text-sm">No phases yet.</p>
        ) : (
          project.phases.map(phase => (
            <PhaseAccordion key={phase.id} phase={phase} onTaskClick={setSelectedTask} />
          ))
        )}
      </div>

      <TaskDetailDrawer task={selectedTask} onClose={() => setSelectedTask(null)} />
    </div>
  )
}
