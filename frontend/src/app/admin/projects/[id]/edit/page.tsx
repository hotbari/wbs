'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminGuard from '@/components/guards/AdminGuard'
import { useProject, useUpdateProject, useCreatePhase, useDeletePhase, useCreateTask } from '@/lib/hooks/useProjects'

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: project } = useProject(id)
  const { mutate: update, isPending } = useUpdateProject(id)
  const { mutate: createPhase } = useCreatePhase(id)
  const { mutate: deletePhase } = useDeletePhase(id)
  const { mutate: createTask } = useCreateTask(id)
  const [newPhase, setNewPhase] = useState({ name: '', startDate: '', endDate: '', orderIndex: '0' })
  const [newTaskPhaseId, setNewTaskPhaseId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  if (!project) return null

  return (
    <AdminGuard>
      <div className="max-w-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Edit: {project.name}</h1>
          <button
            onClick={() => update({ status: 'ARCHIVED' }, { onSuccess: () => router.push('/projects') })}
            className="text-sm text-red-500 hover:underline"
          >
            Archive Project
          </button>
        </div>

        {/* Phases */}
        <div>
          <h2 className="font-medium mb-3">Phases</h2>
          {project.phases.map(phase => (
            <div key={phase.id} className="flex items-center justify-between border rounded p-3 mb-2">
              <div>
                <p className="font-medium text-sm">{phase.name}</p>
                <p className="text-xs text-gray-400">{phase.startDate} → {phase.endDate} (order: {phase.orderIndex})</p>
                <p className="text-xs text-gray-400">{phase.tasks.length} tasks</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewTaskPhaseId(phase.id)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  + Task
                </button>
                <button
                  onClick={() => deletePhase(phase.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {/* Add task inline */}
          {newTaskPhaseId && (
            <div className="border rounded p-3 mb-2 bg-blue-50">
              <p className="text-xs font-medium mb-2">New task in: {project.phases.find(p => p.id === newTaskPhaseId)?.name}</p>
              <div className="flex gap-2">
                <input
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button
                  onClick={() => createTask(
                    { phaseId: newTaskPhaseId, body: { title: newTaskTitle } },
                    { onSuccess: () => { setNewTaskPhaseId(null); setNewTaskTitle('') } }
                  )}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add
                </button>
                <button onClick={() => setNewTaskPhaseId(null)} className="text-sm text-gray-400">Cancel</button>
              </div>
            </div>
          )}

          {/* Add phase form */}
          <div className="border rounded p-3 bg-gray-50 space-y-2">
            <p className="text-sm font-medium">Add Phase</p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Phase name" value={newPhase.name}
                onChange={e => setNewPhase(f => ({ ...f, name: e.target.value }))}
                className="border rounded px-2 py-1 text-sm col-span-2" />
              <input type="date" value={newPhase.startDate}
                onChange={e => setNewPhase(f => ({ ...f, startDate: e.target.value }))}
                className="border rounded px-2 py-1 text-sm" />
              <input type="date" value={newPhase.endDate}
                onChange={e => setNewPhase(f => ({ ...f, endDate: e.target.value }))}
                className="border rounded px-2 py-1 text-sm" />
              <input type="number" placeholder="Order" value={newPhase.orderIndex}
                onChange={e => setNewPhase(f => ({ ...f, orderIndex: e.target.value }))}
                className="border rounded px-2 py-1 text-sm" />
            </div>
            <button
              onClick={() => createPhase(
                { name: newPhase.name, startDate: newPhase.startDate,
                  endDate: newPhase.endDate, orderIndex: parseInt(newPhase.orderIndex) },
                { onSuccess: () => setNewPhase({ name: '', startDate: '', endDate: '', orderIndex: '0' }) }
              )}
              className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm"
            >
              Add Phase
            </button>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
